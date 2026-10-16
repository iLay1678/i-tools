// CSS 生成器：渐变 / 阴影 / 圆角 → CSS 值（纯函数，零依赖）。
// 契约见设计文档 §3.9。风格：单引号 + 无分号。

export interface GradientStop {
  id: string
  color: string
  position: number
}

export interface GradientConfig {
  type: 'linear' | 'radial'
  angle: number
  stops: GradientStop[]
}

export interface ShadowLayer {
  id: string
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

export interface Corners {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
}

export interface RadiusConfig {
  corners: Corners
  slashEnabled: boolean
  vertical?: Corners
}

export type CssStyle = Record<string, string>

function sortedStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((left, right) => left.position - right.position)
}

/** 生成 linear-gradient / radial-gradient 值（色停自动按位置排序）。 */
export function gradientValue(config: GradientConfig): string {
  const stops = sortedStops(config.stops)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ')
  if (config.type === 'radial') return `radial-gradient(circle, ${stops})`
  const angle = Number.isFinite(config.angle) ? config.angle : 0
  return `linear-gradient(${angle}deg, ${stops})`
}

/** 生成多层 box-shadow 值；无层时返回 none。 */
export function shadowValue(layers: ShadowLayer[]): string {
  if (layers.length === 0) return 'none'
  return layers
    .map((layer) => {
      const prefix = layer.inset ? 'inset ' : ''
      return `${prefix}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${layer.color}`
    })
    .join(', ')
}

function cornersValue(corners: Corners): string {
  return `${corners.topLeft}px ${corners.topRight}px ${corners.bottomRight}px ${corners.bottomLeft}px`
}

/** 生成 border-radius 值（支持斜杠语法：水平 / 垂直）。 */
export function radiusValue(config: RadiusConfig): string {
  const horizontal = cornersValue(config.corners)
  if (config.slashEnabled && config.vertical) {
    return `${horizontal} / ${cornersValue(config.vertical)}`
  }
  return horizontal
}

/**
 * 由声明数组生成单条 CSS 规则。
 * 注意：与 flex-grid.ts 的同名 `buildRule` 是有意重复 —— 二者入参形态不同，
 * 提取共享需额外适配层并引入跨模块耦合，收益不足。
 */
export function buildRule(selector: string, declarations: Array<[string, string]>): string {
  const body = declarations.map(([property, value]) => `  ${property}: ${value};`).join('\n')
  return `${selector} {\n${body}\n}`
}
