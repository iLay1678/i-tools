"use client";

import React from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={zhCN}>
      {children}
    </ConfigProvider>
  );
}
