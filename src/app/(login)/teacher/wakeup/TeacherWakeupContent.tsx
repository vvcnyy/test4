/* eslint-disable @next/next/no-img-element */
"use client";

import moment from "moment";
import { useRouter } from "next/navigation";
import React from "react";
import Swal from "sweetalert2";

import { getApplyStartDate } from "@/app/api/stay/utils";
import { WakeupDB, WakeupData, WakeupGET, getToday } from "@/app/api/wakeup/utils";
import { alert } from "@/utils/alert";
import instance from "@/utils/instance";

const TeacherWakeupContent = ({ initailData }: {
  initailData: {
    all: WakeupGET;
    gender: "male" | "female";
    week: string;
  };
}) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [wakeup, setWakeup] = React.useState<WakeupGET>(initailData.all);
  const [week, setWeek] = React.useState<moment.Moment>(moment(initailData.week, "YYYY-MM-DD"));
  const [gender, setGender] = React.useState<"male" | "female">(initailData.gender);

  const getWakeup = async () => {
    setLoading(true);
    try{
      const res = await instance.get("/api/wakeup");
      setWakeup(res.data.data.all);
      setWeek(moment(res.data.data.week, "YYYY-MM-DD"));
      setGender(res.data.data.gender);
      router.refresh();
    }
    catch(e: any){
      alert.error(e.response.data.message);
    }
    setLoading(false);
  };

  const checkDelete = async (id: WakeupDB["id"]) => { 
    Swal.fire({
      title: "기상송 삭제",
      text: "기상송을 삭제합니다. 주의하세요.",
      showCancelButton: true,
      confirmButtonText: "삭제하기",
      confirmButtonColor: "#e11d48",
      cancelButtonText: "취소",
      icon: "warning",
      background: "rgb(var(--color-white) / 1)",
      color: "rgb(var(--color-text) / 1)",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await deleteWakeup(id);
      }
    });
  };

  const checkPlay = async(v: any, key:any, _gender: any) => { 
    Swal.fire({
      title: "기상송 선정",
      text: "기상송으로 선정합니다. 주의하세요.",
      showCancelButton: true,
      confirmButtonText: "선정하기",
      confirmButtonColor: "#e11d48",
      cancelButtonText: "취소",
      icon: "warning",
      background: "rgb(var(--color-white) / 1)",
      color: "rgb(var(--color-text) / 1)",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await playWakeup(v, key, _gender);
      }
    });
  };

  const deleteWakeup = async (id: WakeupDB["id"]) => {
    setLoading(true);
    const loading = alert.loading("기상송 삭제 중 입니다.");
    try{
      const res = await instance.post(
        "/api/teacher/wakeup", {
          id
        }
      );
      await getWakeup();
      alert.update(loading, res.data.message, "success");
    }
    catch(e: any){
      alert.update(loading, e.response.data.message, "error");
    }
    setLoading(false);
  };

  const playWakeup = async (v: any, key: WakeupDB["id"], _gender:string) => {
    setLoading(true);
    const loading = alert.loading("기상송으로 선정 중입니다.");
    try {
      const putData: WakeupData = {
        title: v.title,
        id: key,
        date: getToday().format("YYYY-MM-DD"),
        week: await getApplyStartDate(),
        gender: _gender,
        owner: ""
      };
      
      const res = await instance.post(
        "/api/teacher/wakeup/play", {
          putData
        }
      );
      
      deleteWakeup(key);

      await getWakeup();
      alert.update(loading, res.data.message, "success");
    }
    catch(e: any){
      alert.update(loading, e.response.data.message, "error");
    }
    setLoading(false);
  };

  const sunday = week.clone().day(0);
  const saturday = week.clone().day(6).add(1, "day");

  return (
    <article className="flex flex-col gap-3">
      <section className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">기상송 신청 순위</h1>
        <h1 className="text-base">{sunday.format("MM월 DD일")} 18시 00분 ~ {saturday.format("MM월 DD일")} 17시 59분</h1>
      </section>
      <section className={[
        "flex flex-col gap-4 bg-white rounded border border-text/10 p-5 overflow-auto",
        loading ? "loading_background" : "",
      ].join(" ")}>
          
        <table className="w-full overflow-auto">
          <tbody className="w-full border-y border-text/10 overflow-auto">
            <tr className="w-full">
              <th className="text-center px-4 whitespace-nowrap py-2 font-semibold w-full" colSpan={2}>{gender === "male" ? "남" : "여"}학생 기상송 신청 순위</th>
              <td className="text-center px-4 ">삭제</td>
              <td className="text-center px-4">재생</td>
            </tr>
            {
              Object.keys(wakeup).length ? Object.entries(wakeup)
                .sort((a, b) => a[1].count > b[1].count ? -1 : 1).map(([key, v], i) => (
                  <tr className="w-full border-y border-text/10" key={i}>
                    <td className="text-center px-4 whitespace-nowrap py-2">{i + 1}</td>
                    <td 
                      className="w-full text-left p-4 border-x border-text/10"
                      onClick={() => {
                        const win = window.open(`https://www.youtube.com/watch?v=${key}`, "_blank");
                        if(win) win.focus();
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <img 
                          src={`https://i.ytimg.com/vi/${key}/default.jpg`} 
                          alt={v.title}
                          className="max-w-[160px] object-cover rounded aspect-video cursor-pointer"
                        />
                        <p className="text-left cursor-pointer">[{v.count}표] {v.title}</p>
                      </div>
                    </td>
                    <td 
                      className="text-center px-4 select-none"
                      onClick={() => checkDelete(key)}
                    >
                      <div className="flex justify-center items-center h-full">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.99998 11.0538L13.0731 14.1269C13.2115 14.2653 13.3856 14.3362 13.5952 14.3394C13.8048 14.3426 13.982 14.2718 14.1269 14.1269C14.2718 13.982 14.3442 13.8064 14.3442 13.6C14.3442 13.3936 14.2718 13.2179 14.1269 13.0731L11.0538 9.99998L14.1269 6.92688C14.2653 6.78843 14.3362 6.61439 14.3394 6.40478C14.3426 6.19518 14.2718 6.01794 14.1269 5.87308C13.982 5.72819 13.8064 5.65575 13.6 5.65575C13.3936 5.65575 13.2179 5.72819 13.0731 5.87308L9.99998 8.94615L6.92688 5.87308C6.78843 5.73461 6.61439 5.66378 6.40478 5.66058C6.19518 5.65736 6.01794 5.72819 5.87308 5.87308C5.72819 6.01794 5.65575 6.19358 5.65575 6.39998C5.65575 6.60638 5.72819 6.78201 5.87308 6.92688L8.94615 9.99998L5.87308 13.0731C5.73461 13.2115 5.66378 13.3856 5.66058 13.5952C5.65736 13.8048 5.72819 13.982 5.87308 14.1269C6.01794 14.2718 6.19358 14.3442 6.39998 14.3442C6.60638 14.3442 6.78201 14.2718 6.92688 14.1269L9.99998 11.0538ZM10.0016 19.5C8.68772 19.5 7.45268 19.2506 6.29655 18.752C5.1404 18.2533 4.13472 17.5765 3.2795 16.7217C2.42427 15.8669 1.74721 14.8616 1.24833 13.706C0.749442 12.5504 0.5 11.3156 0.5 10.0017C0.5 8.68772 0.749334 7.45268 1.248 6.29655C1.74667 5.1404 2.42342 4.13472 3.27825 3.2795C4.1331 2.42427 5.13834 1.74721 6.29398 1.24833C7.44959 0.749443 8.68437 0.5 9.9983 0.5C11.3122 0.5 12.5473 0.749334 13.7034 1.248C14.8596 1.74667 15.8652 2.42342 16.7205 3.27825C17.5757 4.1331 18.2527 5.13834 18.7516 6.29398C19.2505 7.44959 19.5 8.68437 19.5 9.9983C19.5 11.3122 19.2506 12.5473 18.752 13.7034C18.2533 14.8596 17.5765 15.8652 16.7217 16.7205C15.8669 17.5757 14.8616 18.2527 13.706 18.7516C12.5504 19.2505 11.3156 19.5 10.0016 19.5ZM9.99998 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 9.99998C18 7.76664 17.225 5.87498 15.675 4.32498C14.125 2.77498 12.2333 1.99998 9.99998 1.99998C7.76664 1.99998 5.87498 2.77498 4.32498 4.32498C2.77498 5.87498 1.99998 7.76664 1.99998 9.99998C1.99998 12.2333 2.77498 14.125 4.32498 15.675C5.87498 17.225 7.76664 18 9.99998 18Z" fill="rgb(var(--color-text) / .35)"/>
                        </svg>
                      </div>
                    </td>
                    <td 
                      className="text-center px-4 select-none"
                      onClick={() => checkPlay(v, key, gender)}
                    >
                      <div className="flex justify-center items-center h-full">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 19.5C8.68629 19.5 7.45232 19.2506 6.29634 18.7521C5.14036 18.2535 4.1347 17.5769 3.2795 16.7221C2.42431 15.8673 1.74771 14.8616 1.24917 13.7057C0.750636 12.5498 0.501221 11.3158 0.501221 10.0021C0.501221 8.68843 0.750636 7.45445 1.24917 6.29853C1.74771 5.1426 2.42431 4.13692 3.2795 3.28209C4.1347 2.42726 5.14036 1.75067 6.29634 1.25213C7.45232 0.753597 8.68629 0.504181 10 0.504181C11.3137 0.504181 12.5477 0.753597 13.7037 1.25213C14.8597 1.75067 15.8654 2.42726 16.7206 3.28209C17.5758 4.13692 18.2524 5.1426 18.7509 6.29853C19.2495 7.45445 19.4989 8.68843 19.4989 10.0021C19.4989 11.3158 19.2495 12.5498 18.7509 13.7057C18.2524 14.8616 17.5758 15.8673 16.7206 16.7221C15.8654 17.5769 14.8597 18.2535 13.7037 18.7521C12.5477 19.2506 11.3137 19.5 10 19.5ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76664 17.225 5.87498 15.675 4.32498C14.125 2.77498 12.2333 1.99998 10 1.99998C7.76664 1.99998 5.87498 2.77498 4.32498 4.32498C2.77498 5.87498 1.99998 7.76664 1.99998 10C1.99998 12.2333 2.77498 14.125 4.32498 15.675C5.87498 17.225 7.76664 18 10 18ZM8 13.2L4.8 10L3.6 11.2L8 15.6L16.4 7.19998L15.2 5.99998L8 13.2Z" fill="rgb(var(--color-text) / .35)"/>
                        </svg>
                      </div>
                    </td>
                  </tr>
                )) : (
                <tr className="w-full border-y border-text/10">
                  <td className="text-center px-4 whitespace-nowrap py-2 text-text/50" colSpan={3}>신청된 기상송이 없습니다.</td>
                </tr>
              )
            }
          </tbody>
        </table>
      </section>
    </article>
  );
};

export default TeacherWakeupContent;