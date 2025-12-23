'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Home } from 'lucide-react'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen font-sans antialiased flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-xl items-center mx-auto px-4">
          <div className="mr-8 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2 transition-colors hover:text-primary/90">
              <span className="hidden font-bold sm:inline-block text-xl tracking-tight">
                爱拓工具箱
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/"
                className="transition-colors hover:text-primary text-foreground/80 flex items-center gap-2 group"
              >
                <div className="p-1 rounded-md group-hover:bg-accent">
                  <Home className="h-4 w-4" />
                </div>
                <span>首页</span>
              </Link>
              <Link
                href="https://github.com/iLay1678/i-tools"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-primary text-foreground/80 flex items-center gap-2 group"
              >
                 <div className="p-1 rounded-md group-hover:bg-accent">
                  <Github className="h-4 w-4" />
                </div>
                <span>GitHub</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container max-w-screen-xl mx-auto py-8 px-4 lg:py-12">
          {children}
        </div>
      </main>

      <footer className="py-6 border-t bg-muted/30">
        <div className="container max-w-screen-xl mx-auto px-4 flex flex-col items-center justify-center gap-4">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            版权所有 © {new Date().getFullYear()} 爱拓工具箱
          </p>
        </div>
      </footer>
    </div>
  )
}
