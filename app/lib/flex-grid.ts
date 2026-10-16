// Flex / Grid 布局配置 → CSS 与样式对象（纯函数，零依赖）。
// 契约见设计文档 §3.5。风格：单引号 + 无分号。

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse'
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline'
export type AlignContent = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'

export interface FlexConfig {
  direction: FlexDirection
  wrap: FlexWrap
  justifyContent: JustifyContent
  alignItems: AlignItems
  alignContent: AlignContent
  gap: number
  itemCount: number
  itemSize: number
  growIndex: number | null // 需 flex-grow 的子项下标
}

export interface GridConfig {
  columns: number
  gap: number
  justifyContent: JustifyContent
  alignItems: AlignItems
}

export type ContainerStyle = Record<string, string>

/**
 * 由容器样式对象生成单条 CSS 规则。
 * 注意：与 css-gen.ts 的同名 `buildRule` 是有意重复 —— 二者入参形态不同
 * （此处为 Record<string,string>，css-gen 为声明元组数组），提取共享会引入跨模块耦合。
 */
export function buildRule(selector: string, style: ContainerStyle): string {
  const declarations = Object.entries(style)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n')
  return `${selector} {\n${declarations}\n}`
}

export function buildFlexStyle(config: FlexConfig): ContainerStyle {
  return {
    display: 'flex',
    'flex-direction': config.direction,
    'flex-wrap': config.wrap,
    'justify-content': config.justifyContent,
    'align-items': config.alignItems,
    'align-content': config.alignContent,
    gap: `${config.gap}px`,
  }
}

export function buildFlexCss(config: FlexConfig): string {
  const parts: string[] = [buildRule('.container', buildFlexStyle(config))]
  parts.push(
    buildRule('.container > .item', {
      width: `${config.itemSize}px`,
      height: `${config.itemSize}px`,
    }),
  )
  if (config.growIndex !== null && config.growIndex >= 0) {
    parts.push(
      buildRule(`.container > .item:nth-child(${config.growIndex + 1})`, {
        'flex-grow': '1',
      }),
    )
  }
  return parts.join('\n\n')
}

export function buildGridStyle(config: GridConfig): ContainerStyle {
  return {
    display: 'grid',
    'grid-template-columns': `repeat(${config.columns}, minmax(0, 1fr))`,
    'justify-content': config.justifyContent,
    'align-items': config.alignItems,
    gap: `${config.gap}px`,
  }
}

export function buildGridCss(config: GridConfig): string {
  return buildRule('.container', buildGridStyle(config))
}
