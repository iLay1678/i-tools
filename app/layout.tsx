import React from 'react'
import { Toaster } from "@/components/ui/sonner"
import ClientLayout from './components/ClientLayout'
import './globals.css'

export const metadata = {
  title: '爱拓工具箱 - 在线工具集合',
  description: '爱拓工具箱提供各种实用的在线工具，包括JSON格式化、文本处理、编码转换、二维码生成等。',
  keywords: '在线工具,JSON格式化,二维码生成器,文本处理,编码工具,爱拓工具箱',
  authors: [{ name: '爱拓工具箱' }],
}

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}
