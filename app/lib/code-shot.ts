// 代码截图美化：主题表 + Canvas 2D 手工绘制管线（零依赖，无语法高亮）。
// 契约见设计文档 §3.4。风格：单引号 + 无分号。
// 说明：本模块不获取 document/window；Canvas 由调用方传入，devicePixelRatio 通过
// canvas.ownerDocument.defaultView 读取，避免触碰全局对象。

export interface CodeShotTheme {
  id: string
  name: string
  gradientFrom: string
  gradientTo: string
  codeColor: string
  lineNumberColor: string
  windowDot: boolean
  fontSize: number
  lineHeight: number
}

export interface CodeShotConfig {
  themeId: string
  padding: number // 16–96
  radius: number // 0–32
  fontSize: number // 12–24
  showLineNumbers: boolean
  scale: 1 | 2
  customBackground: string // 十六进制；空则用主题渐变
  watermark: string // 默认 ''
}

export interface CodeShotResult {
  width: number
  height: number
  truncated: boolean
  totalLines: number
}

export const CODE_SHOT_THEMES: readonly CodeShotTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    gradientFrom: '#0f172a',
    gradientTo: '#1e293b',
    codeColor: '#e2e8f0',
    lineNumberColor: '#64748b',
    windowDot: true,
    fontSize: 14,
    lineHeight: 1.6,
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    gradientFrom: '#0d1117',
    gradientTo: '#161b22',
    codeColor: '#c9d1d9',
    lineNumberColor: '#6e7681',
    windowDot: true,
    fontSize: 14,
    lineHeight: 1.6,
  },
  {
    id: 'solarized',
    name: 'Solarized',
    gradientFrom: '#002b36',
    gradientTo: '#073642',
    codeColor: '#93a1a1',
    lineNumberColor: '#586e75',
    windowDot: false,
    fontSize: 14,
    lineHeight: 1.6,
  },
  {
    id: 'dracula',
    name: 'Dracula',
    gradientFrom: '#282a36',
    gradientTo: '#44475a',
    codeColor: '#f8f8f2',
    lineNumberColor: '#6272a4',
    windowDot: true,
    fontSize: 14,
    lineHeight: 1.6,
  },
  {
    id: 'paper',
    name: 'Paper',
    gradientFrom: '#ffffff',
    gradientTo: '#f1f5f9',
    codeColor: '#1e293b',
    lineNumberColor: '#94a3b8',
    windowDot: false,
    fontSize: 14,
    lineHeight: 1.7,
  },
  {
    id: 'nord',
    name: 'Nord',
    gradientFrom: '#2e3440',
    gradientTo: '#3b4252',
    codeColor: '#d8dee9',
    lineNumberColor: '#7b88a1',
    windowDot: true,
    fontSize: 14,
    lineHeight: 1.6,
  },
]

export const MAX_SHOT_LINES = 500
export const MAX_CANVAS_WIDTH = 4096
export const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

interface RenderRow {
  text: string
  label: string
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

/** 按最大宽度折行，续行沿用原始缩进。 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  indent: string,
): string[] {
  if (text.length === 0) return ['']
  const chars = Array.from(text)
  const segments: string[] = []
  let current = ''
  for (const ch of chars) {
    const candidate = current + ch
    if (current.length > 0 && ctx.measureText(candidate).width > maxWidth) {
      segments.push(current)
      current = indent + ch
    } else {
      current = candidate
    }
  }
  segments.push(current)
  return segments
}

function leadingIndent(line: string): string {
  const match = /^\s*/.exec(line)
  return match ? match[0] : ''
}

export function renderCodeShot(canvas: HTMLCanvasElement, code: string, config: CodeShotConfig): CodeShotResult {
  const ctx = canvas.getContext('2d')
  const rawLines = code.length === 0 ? [] : code.split('\n')
  const totalLines = rawLines.length

  if (!ctx) {
    return { width: 0, height: 0, truncated: false, totalLines }
  }

  const theme = CODE_SHOT_THEMES.find((item) => item.id === config.themeId) ?? CODE_SHOT_THEMES[0]
  const fontSize = clamp(Math.round(config.fontSize), 12, 24)
  const lineHeight = Math.round(fontSize * theme.lineHeight)
  const padding = clamp(Math.round(config.padding), 16, 96)
  const radius = clamp(Math.round(config.radius), 0, 32)

  const view = canvas.ownerDocument ? canvas.ownerDocument.defaultView : null
  let dpr = view && view.devicePixelRatio > 0 ? view.devicePixelRatio : 1
  let scale = config.scale

  const truncated = rawLines.length > MAX_SHOT_LINES
  const visibleLines = truncated ? rawLines.slice(0, MAX_SHOT_LINES) : rawLines

  ctx.font = `${fontSize}px ${MONO_FONT}`
  const digitCount = String(Math.max(visibleLines.length, 1)).length
  const numberGutter = config.showLineNumbers ? Math.ceil(ctx.measureText('9'.repeat(digitCount)).width) + fontSize : 0
  const maxContentWidth = Math.max(160, MAX_CANVAS_WIDTH - padding * 2 - numberGutter)

  const rows: RenderRow[] = []
  visibleLines.forEach((line, index) => {
    const segments = wrapText(ctx, line, maxContentWidth, leadingIndent(line))
    segments.forEach((segment, segmentIndex) => {
      rows.push({ text: segment, label: segmentIndex === 0 ? String(index + 1) : '' })
    })
  })
  if (truncated) {
    rows.push({ text: `…（共 ${rawLines.length} 行，已截断）`, label: '' })
  }

  let contentWidth = 0
  for (const row of rows) {
    contentWidth = Math.max(contentWidth, ctx.measureText(row.text).width)
  }

  const windowBarHeight = theme.windowDot ? Math.round(fontSize * 2.4) : Math.round(fontSize * 1.2)
  const logicalWidth = Math.max(240, Math.round(padding * 2 + numberGutter + contentWidth))
  const logicalHeight = Math.max(120, Math.round(padding * 2 + windowBarHeight + rows.length * lineHeight))

  if (logicalWidth * dpr * scale > MAX_CANVAS_WIDTH) scale = 1
  if (logicalWidth * dpr > MAX_CANVAS_WIDTH) dpr = 1

  const effective = dpr * scale
  canvas.width = Math.round(logicalWidth * effective)
  canvas.height = Math.round(logicalHeight * effective)
  canvas.style.width = `${logicalWidth}px`
  canvas.style.height = `${logicalHeight}px`

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.scale(effective, effective)

  // 圆角矩形背景（自定义纯色优先，否则主题线性渐变）。
  roundedRectPath(ctx, 0, 0, logicalWidth, logicalHeight, radius)
  if (config.customBackground.length > 0 && HEX_COLOR.test(config.customBackground)) {
    ctx.fillStyle = config.customBackground
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, logicalHeight)
    gradient.addColorStop(0, theme.gradientFrom)
    gradient.addColorStop(1, theme.gradientTo)
    ctx.fillStyle = gradient
  }
  ctx.fill()

  // 顶部窗口圆点。
  if (theme.windowDot) {
    const radiusDot = fontSize * 0.32
    const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f']
    const centerY = padding * 0.6 + fontSize * 0.6
    dotColors.forEach((color, index) => {
      ctx.beginPath()
      ctx.arc(padding + radiusDot + index * (radiusDot * 2 + fontSize * 0.4), centerY, radiusDot, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })
  }

  // 代码逐行绘制。
  ctx.font = `${fontSize}px ${MONO_FONT}`
  ctx.textBaseline = 'top'
  let y = padding + windowBarHeight
  for (const row of rows) {
    if (config.showLineNumbers && row.label.length > 0) {
      ctx.fillStyle = theme.lineNumberColor
      ctx.textAlign = 'right'
      ctx.fillText(row.label, padding + numberGutter - fontSize * 0.6, y)
    }
    ctx.fillStyle = theme.codeColor
    ctx.textAlign = 'left'
    ctx.fillText(row.text, padding + numberGutter, y)
    y += lineHeight
  }

  // 右下角水印（用户自填，默认空）。
  const watermark = config.watermark.trim()
  if (watermark.length > 0) {
    ctx.font = `${Math.max(11, fontSize - 2)}px ${MONO_FONT}`
    ctx.fillStyle = theme.lineNumberColor
    ctx.textAlign = 'right'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(watermark, logicalWidth - padding * 0.6, logicalHeight - padding * 0.4)
  }

  return { width: canvas.width, height: canvas.height, truncated, totalLines }
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('无法导出 PNG 图片'))
    }, 'image/png')
  })
}
