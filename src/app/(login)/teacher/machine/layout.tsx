import React from "react";

import SubMenu from "@/components/submenu";
import Insider from "@/provider/insider";

import { menu } from "./utils";

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <SubMenu menu={menu} subadd={1} />
      <Insider>
        {children}
      </Insider>
    </>
  );
};

export default Layout;