'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { FileCode, Copy, Download, Trash2, Eye, Edit3, AlertTriangle } from 'lucide-react'

const DEFAULT_MERMAID = `flowchart TD
  A[开始] --> B{是否通过?}
  B -->|是| C[发布]
  B -->|否| D[修正]
  D --> B`

const MERMAID_SCRIPT_ID = 'mermaid-cdn-script'
const MERMAID_SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'

type MermaidApi = {
  initialize: (config: { startOnLoad: boolean; securityLevel: string; theme: string }) => void
  render: (id: string, source: string) => Promise<{ svg: string }>
}

declare global {
  interface Window {
    mermaid?: MermaidApi
  }
}

const mermaidScriptReadyMap = new Map<string, Promise<void>>()

const loadMermaidScript = () => {
  const existingPromise = mermaidScriptReadyMap.get(MERMAID_SCRIPT_SRC)

  if (existingPromise) return existingPromise

  const scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.mermaid) {
      resolve()
      return
    }

    const existingScript = document.getElementById(MERMAID_SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Mermaid 脚本加载失败')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = MERMAID_SCRIPT_ID
    script.src = MERMAID_SCRIPT_SRC
    script.async = true

    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Mermaid 脚本加载失败')), { once: true })

    document.head.appendChild(script)
  })

  mermaidScriptReadyMap.set(MERMAID_SCRIPT_SRC, scriptPromise)
  return scriptPromise
}

export default function MermaidClient() {
  const [source, setSource] = useState(DEFAULT_MERMAID)
  const [svg, setSvg] = useState('')
  const [renderError, setRenderError] = useState('')
  const [isMermaidReady, setIsMermaidReady] = useState(false)
  const mermaidRef = useRef<MermaidApi | null>(null)

  useEffect(() => {
    let mounted = true

    const loadMermaid = async () => {
      try {
        await loadMermaidScript()
        const mermaid = window.mermaid

        if (!mermaid) {
          throw new Error('Mermaid 未正确挂载到浏览器环境')
        }

        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' })

        if (!mounted) return

        mermaidRef.current = mermaid
        setIsMermaidReady(true)
      } catch (err) {
        if (!mounted) return

        setRenderError(err instanceof Error ? err.message : 'Mermaid 加载失败')
      }
    }

    loadMermaid()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const mermaid = mermaidRef.current

    if (!isMermaidReady || !mermaid) return

    let active = true

    const render = async () => {
      try {
        setRenderError('')
        const id = `mermaid-${Date.now()}`
        const result = await mermaid.render(id, source)

        if (active) setSvg(result.svg)
      } catch (err) {
        if (!active) return

        setSvg('')
        setRenderError(err instanceof Error ? err.message : 'Mermaid 渲染失败')
      }
    }

    render()

    return () => {
      active = false
    }
  }, [isMermaidReady, source])

  const previewSrc = useMemo(() => (svg ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}` : ''), [svg])

  const copySvg = async () => {
    if (!svg) return

    try {
      await navigator.clipboard.writeText(svg)
      toast.success('SVG 已复制')
    } catch {
      toast.error('复制失败')
    }
  }

  const downloadSvg = () => {
    if (!svg) return

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = 'mermaid.svg'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('开始下载 SVG')
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-indigo-600 shadow-lg">
            <FileCode className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mermaid 在线编辑</h1>
            <p className="text-muted-foreground">客户端安全渲染，实时生成 SVG</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSource('')}> <Trash2 className="h-4 w-4 lg:mr-2" /><span className="hidden lg:inline">清空</span></Button>
          <Button variant="outline" size="sm" onClick={copySvg} disabled={!svg}> <Copy className="h-4 w-4 lg:mr-2" /><span className="hidden lg:inline">复制</span></Button>
          <Button size="sm" onClick={downloadSvg} disabled={!svg}> <Download className="h-4 w-4 lg:mr-2" /><span className="hidden lg:inline">下载 .svg</span></Button>
        </div>
      </div>

      {renderError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isMermaidReady ? '渲染错误' : '加载错误'}</AlertTitle>
          <AlertDescription>{renderError}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 min-h-0 grid grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-4 lg:gap-6">
        <Card className="flex flex-col min-h-0 border-0 shadow-lg ring-1 ring-border">
          <CardHeader className="py-2 px-4 border-b bg-muted/30 flex flex-row items-center space-y-0"><CardTitle className="text-sm font-medium flex items-center gap-2"><Edit3 className="h-4 w-4" />编辑</CardTitle></CardHeader>
          <CardContent className="p-0 flex-1 min-h-0"><Textarea value={source} onChange={(e) => setSource(e.target.value)} className="h-full min-h-full resize-none rounded-none border-0 font-mono text-xs" placeholder="输入 Mermaid 语法" /></CardContent>
        </Card>

        <Card className="flex flex-col min-h-0 border-0 shadow-lg ring-1 ring-border overflow-hidden">
          <CardHeader className="py-2 px-4 border-b bg-muted/30 flex flex-row items-center space-y-0"><CardTitle className="text-sm font-medium flex items-center gap-2"><Eye className="h-4 w-4" />预览</CardTitle></CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-auto p-6 bg-white dark:bg-zinc-950">
            {svg ? <img src={previewSrc} alt="Mermaid preview" className="max-h-full max-w-full object-contain" /> : <div className="text-sm text-muted-foreground">{isMermaidReady ? '等待渲染结果。' : '正在加载 Mermaid 渲染器…'}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
