// JSON → TypeScript / Go / Rust 类型推断与代码生成（纯函数，零依赖）。
// 契约见设计文档 §3.1：导出签名逐字一致，禁用 any，成功/失败用判别式联合。
// 风格：单引号 + 无分号，对齐 app/lib/toolbox.ts。

export type NamingStyle = 'preserve' | 'camelCase' | 'snake_case' | 'PascalCase'

export interface InferOptions {
  rootName: string
  naming: NamingStyle
}

export interface InferredField {
  key: string // 原始 JSON 键名
  name: string // 按 naming 转换后的字段名
  optional: boolean // 数组合并时缺失 => true
  type: InferredNode
}

export type InferredNode =
  | { kind: 'string' }
  | { kind: 'number' }
  | { kind: 'boolean' }
  | { kind: 'null' }
  | { kind: 'unknown' } // 空数组 / 无法推断
  | { kind: 'array'; element: InferredNode }
  | { kind: 'object'; typeName: string; fields: InferredField[] }

export interface InferResult {
  root: InferredNode
  typeCount: number
}

export interface AnalyzeError {
  message: string
  position?: number
}

export type AnalyzeResult =
  | { ok: true; result: InferResult }
  | { ok: false; error: AnalyzeError }

export const MAX_DEPTH = 20
export const MAX_NODES = 50000

type ObjectNode = Extract<InferredNode, { kind: 'object' }>

/** 推断期间可变的节点计数器。 */
interface NodeCounter {
  count: number
}

/** 推断超限（深度 / 节点数）时抛出的内部错误。 */
class InferLimitError extends Error {
  readonly reason: 'depth' | 'nodes'

  constructor(reason: 'depth' | 'nodes') {
    super(reason === 'depth' ? '结构过深' : '结构过大')
    this.name = 'InferLimitError'
    this.reason = reason
  }
}

const IDENTIFIER_SEPARATOR = /[^A-Za-z0-9\u4e00-\u9fff]+/

/** 将任意键名拆分为词片段（兼容 camelCase / snake_case / 中文）。 */
function splitWords(raw: string): string[] {
  return raw
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(IDENTIFIER_SEPARATOR)
    .filter((word) => word.length > 0)
}

function capitalize(word: string): string {
  if (word.length === 0) return word
  return word[0].toUpperCase() + word.slice(1)
}

function toPascalCase(raw: string): string {
  return splitWords(raw).map(capitalize).join('')
}

function toCamelCase(raw: string): string {
  const words = splitWords(raw)
  if (words.length === 0) return raw
  return words[0].toLowerCase() + words.slice(1).map(capitalize).join('')
}

function toSnakeCase(raw: string): string {
  return splitWords(raw)
    .map((word) => word.toLowerCase())
    .join('_')
}

function convertName(raw: string, naming: NamingStyle): string {
  switch (naming) {
    case 'camelCase':
      return toCamelCase(raw)
    case 'snake_case':
      return toSnakeCase(raw)
    case 'PascalCase':
      return toPascalCase(raw)
    default:
      return raw
  }
}

/** 子类型命名：父类型名 + PascalCase 键名（Root_User 风格，三语言同名规则）。 */
function childTypeName(parentName: string, key: string): string {
  const suffix = toPascalCase(key) || 'Field'
  return `${parentName}_${suffix}`
}

/** 清理根类型名，保证是可用的标识符。 */
function sanitizeRootName(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return 'Root'
  return trimmed.replace(/[^A-Za-z0-9_\u4e00-\u9fff]/g, '_')
}

/**
 * 从 JSON.parse 的报错信息中提取出错字符下标（0 基）。
 * 兼容 Node 20+/22 的多种 V8 措辞：
 *  1) "... at position 12 (line 3 column 4)" / "... at position 12"
 *  2) 仅给出 "(line 3 column 4)" 的版本 —— 由源码换算为字符下标
 * 若确实无法定位（如 "Unexpected token '}', ..." 这种不含位置的措辞），返回 undefined，
 * 由调用方把 JSON.parse 的原始错误消息原样透传到 UI，绝不吞掉信息。
 */
function extractPosition(message: string, source: string): number | undefined {
  const posMatch = /(?:at\s+)?position\s+(\d+)/i.exec(message)
  if (posMatch) return Number(posMatch[1])

  const lineColMatch = /line\s+(\d+)\s+column\s+(\d+)/i.exec(message)
  if (lineColMatch) {
    const line = Number(lineColMatch[1])
    const column = Number(lineColMatch[2])
    const lines = source.split('\n')
    let index = 0
    for (let i = 0; i < line - 1 && i < lines.length; i += 1) {
      index += lines[i].length + 1 // +1 计入换行符
    }
    return index + Math.max(0, column - 1)
  }

  return undefined
}

function inferValue(
  value: unknown,
  typeName: string,
  options: InferOptions,
  depth: number,
  counter: NodeCounter,
): InferredNode {
  counter.count += 1
  if (counter.count > MAX_NODES) throw new InferLimitError('nodes')
  if (depth > MAX_DEPTH) throw new InferLimitError('depth')

  if (value === null) return { kind: 'null' }

  const valueType = typeof value
  if (valueType === 'string') return { kind: 'string' }
  if (valueType === 'number') return { kind: 'number' }
  if (valueType === 'boolean') return { kind: 'boolean' }
  if (Array.isArray(value)) return inferArray(value, typeName, options, depth, counter)
  if (valueType === 'object') {
    return inferObject(value as Record<string, unknown>, typeName, options, depth, counter)
  }
  return { kind: 'unknown' }
}

function inferObject(
  source: Record<string, unknown>,
  typeName: string,
  options: InferOptions,
  depth: number,
  counter: NodeCounter,
): InferredNode {
  const fields: InferredField[] = Object.keys(source).map((key) => ({
    key,
    name: convertName(key, options.naming),
    optional: false,
    type: inferValue(source[key], childTypeName(typeName, key), options, depth + 1, counter),
  }))
  return { kind: 'object', typeName, fields }
}

function inferArray(
  source: unknown[],
  ownerName: string,
  options: InferOptions,
  depth: number,
  counter: NodeCounter,
): InferredNode {
  if (source.length === 0) return { kind: 'array', element: { kind: 'unknown' } }
  const elementName = `${ownerName}_Item`
  const nodes = source.map((item) => inferValue(item, elementName, options, depth + 1, counter))
  return { kind: 'array', element: mergeNodes(nodes, elementName, options) }
}

/** 合并同质节点的并集；异构原始类型退化为 unknown（模型无 union 类型）。 */
function mergeNodes(nodes: InferredNode[], fallbackName: string, options: InferOptions): InferredNode {
  if (nodes.length === 0) return { kind: 'unknown' }
  const first = nodes[0]

  if (nodes.every((node) => node.kind === 'object')) {
    const objects = nodes.filter((node): node is ObjectNode => node.kind === 'object')
    return mergeObjects(objects, options)
  }

  if (nodes.every((node) => node.kind === 'array')) {
    const arrays = nodes.filter((node): node is Extract<InferredNode, { kind: 'array' }> => node.kind === 'array')
    return { kind: 'array', element: mergeNodes(arrays.map((node) => node.element), `${fallbackName}_Item`, options) }
  }

  if (nodes.every((node) => node.kind === first.kind)) return first
  return { kind: 'unknown' }
}

/** 合并多个对象：字段取并集，并集内缺失的字段标记可选。 */
function mergeObjects(objects: ObjectNode[], options: InferOptions): InferredNode {
  const typeName = objects[0].typeName
  const order: string[] = []
  const byKey = new Map<string, InferredNode[]>()

  for (const object of objects) {
    for (const field of object.fields) {
      const list = byKey.get(field.key)
      if (list) {
        list.push(field.type)
      } else {
        byKey.set(field.key, [field.type])
        order.push(field.key)
      }
    }
  }

  const fields: InferredField[] = order.map((key) => {
    const types = byKey.get(key) ?? []
    return {
      key,
      name: convertName(key, options.naming),
      optional: types.length < objects.length,
      type: mergeNodes(types, childTypeName(typeName, key), options),
    }
  })

  return { kind: 'object', typeName, fields }
}

/** 先序收集去重后的对象类型（用于生成命名类型与 typeCount）。 */
function collectUniqueObjects(root: InferredNode): ObjectNode[] {
  const seen = new Set<string>()
  const list: ObjectNode[] = []
  const walk = (node: InferredNode): void => {
    if (node.kind === 'object') {
      if (!seen.has(node.typeName)) {
        seen.add(node.typeName)
        list.push(node)
      }
      for (const field of node.fields) walk(field.type)
    } else if (node.kind === 'array') {
      walk(node.element)
    }
  }
  walk(root)
  return list
}

export function analyzeJson(text: string, options: InferOptions): AnalyzeResult {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: { message: '请输入 JSON 内容' } }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch (error) {
    const detail = error instanceof Error ? error.message : '未知错误'
    return {
      ok: false,
      error: { message: `JSON 解析失败：${detail}`, position: extractPosition(detail, trimmed) },
    }
  }

  const counter: NodeCounter = { count: 0 }
  try {
    const root = inferValue(parsed, sanitizeRootName(options.rootName), options, 0, counter)
    return { ok: true, result: { root, typeCount: collectUniqueObjects(root).length } }
  } catch (error) {
    if (error instanceof InferLimitError) {
      const message =
        error.reason === 'depth'
          ? `结构嵌套超过 ${MAX_DEPTH} 层，建议分批转换`
          : `结构节点数超过 ${MAX_NODES}，建议分批转换`
      return { ok: false, error: { message } }
    }
    return { ok: false, error: { message: '解析失败，请检查输入内容' } }
  }
}

function isSafeTsIdentifier(name: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)
}

function tsType(node: InferredNode): string {
  switch (node.kind) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'null':
      return 'null'
    case 'unknown':
      return 'unknown'
    case 'array':
      return `${tsType(node.element)}[]`
    case 'object':
      return node.typeName
  }
}

export function generateTypeScript(result: InferResult, options: InferOptions): string {
  const lines: string[] = []
  const rootName = sanitizeRootName(options.rootName)

  if (result.root.kind !== 'object') {
    lines.push(`export type ${rootName} = ${tsType(result.root)}`)
    lines.push('')
  }

  const objects = collectUniqueObjects(result.root)
  objects.forEach((object, index) => {
    lines.push(`export interface ${object.typeName} {`)
    for (const field of object.fields) {
      const key = isSafeTsIdentifier(field.name) ? field.name : `'${field.name.replace(/'/g, "\\'")}'`
      lines.push(`  ${key}${field.optional ? '?' : ''}: ${tsType(field.type)};`)
    }
    lines.push('}')
    if (index < objects.length - 1) lines.push('')
  })

  return lines.join('\n')
}

function goType(node: InferredNode): string {
  switch (node.kind) {
    case 'string':
      return 'string'
    case 'number':
      return 'float64'
    case 'boolean':
      return 'bool'
    case 'null':
      return 'interface{}'
    case 'unknown':
      return 'interface{}'
    case 'array':
      return `[]${goType(node.element)}`
    case 'object':
      return node.typeName
  }
}

export function generateGo(result: InferResult, options: InferOptions): string {
  const blocks: string[] = []
  const rootName = sanitizeRootName(options.rootName)

  if (result.root.kind !== 'object') {
    blocks.push(`type ${rootName} ${goType(result.root)}`)
  }

  for (const object of collectUniqueObjects(result.root)) {
    const rendered = object.fields.map((field) => {
      const goName = toPascalCase(field.name) || 'Field'
      let fieldType = goType(field.type)
      if (field.optional && field.type.kind !== 'null' && !fieldType.startsWith('*') && fieldType !== 'interface{}') {
        fieldType = `*${fieldType}`
      }
      const tag = `\`json:"${field.key}${field.optional ? ',omitempty' : ''}"\``
      return { goName, fieldType, tag }
    })

    const nameWidth = rendered.reduce((max, item) => Math.max(max, item.goName.length), 0)
    const typeWidth = rendered.reduce((max, item) => Math.max(max, item.fieldType.length), 0)

    const lines = [`type ${object.typeName} struct {`]
    for (const item of rendered) {
      lines.push(`\t${item.goName.padEnd(nameWidth)} ${item.fieldType.padEnd(typeWidth)} ${item.tag}`)
    }
    lines.push('}')
    blocks.push(lines.join('\n'))
  }

  return blocks.join('\n\n')
}

function isOptionType(node: InferredNode): boolean {
  return node.kind === 'null'
}

function rustType(node: InferredNode): string {
  switch (node.kind) {
    case 'string':
      return 'String'
    case 'number':
      return 'f64'
    case 'boolean':
      return 'bool'
    case 'null':
      return 'Option<serde_json::Value>'
    case 'unknown':
      return 'serde_json::Value'
    case 'array':
      return `Vec<${rustType(node.element)}>`
    case 'object':
      return node.typeName
  }
}

function toRustFieldName(name: string): string {
  const snake = toSnakeCase(name)
  if (snake.length === 0) return 'field'
  if (/^[0-9]/.test(snake)) return `field_${snake}`
  return snake
}

export function generateRust(result: InferResult, options: InferOptions): string {
  const blocks: string[] = []
  const rootName = sanitizeRootName(options.rootName)

  if (result.root.kind !== 'object') {
    blocks.push(`type ${rootName} = ${rustType(result.root)};`)
  }

  const objects = collectUniqueObjects(result.root)
  for (const object of objects) {
    const lines = ['#[derive(Serialize, Deserialize)]', `struct ${object.typeName} {`]
    for (const field of object.fields) {
      const rustName = toRustFieldName(field.name)
      if (rustName !== field.key) {
        lines.push(`    #[serde(rename = "${field.key.replace(/"/g, '\\"')}")]`)
      }
      const fieldType =
        field.optional && !isOptionType(field.type) ? `Option<${rustType(field.type)}>` : rustType(field.type)
      lines.push(`    ${rustName}: ${fieldType},`)
    }
    lines.push('}')
    blocks.push(lines.join('\n'))
  }

  if (objects.length === 0) return blocks.join('\n\n')

  const head = 'use serde::{Serialize, Deserialize};'
  return blocks.length > 0 ? `${head}\n\n${blocks.join('\n\n')}` : head
}
