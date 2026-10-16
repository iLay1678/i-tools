// JSONPath 子集 + 简化 jq 路径的解析器与求值器（纯函数，零依赖）。
// 契约见设计文档 §3.3。风格：单引号 + 无分号。
// 支持的 JSONPath：$ .key ['key'] [n] [-1] [a:b] * .. [0,2] [?(@.x op v)]（含 && / ||）。
// 支持的 jq 路径：.a.b  .a[]  .[1:3]  |  ?。

export type QueryMode = 'jsonpath' | 'jq'

export interface QueryError {
  message: string
  position: number // 出错字符下标（0 基）
}

export interface QueryResult {
  matches: unknown[]
  count: number
}

export type EvaluateResult = { ok: true; result: QueryResult } | { ok: false; error: QueryError }

export const MAX_VISIT_NODES = 100000

type CompareOp = '==' | '!=' | '<' | '<=' | '>' | '>='

type Operand =
  | { kind: 'path'; segments: string[] }
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'boolean'; value: boolean }

type Predicate =
  | { kind: 'or'; parts: Predicate[] }
  | { kind: 'and'; parts: Predicate[] }
  | { kind: 'compare'; left: Operand; op: CompareOp; right: Operand }

type Step =
  | { kind: 'field'; name: string }
  | { kind: 'wildcard' }
  | { kind: 'index'; index: number }
  | { kind: 'slice'; start: number | null; end: number | null }
  | { kind: 'unionIndex'; indices: number[] }
  | { kind: 'unionKey'; keys: string[] }
  | { kind: 'filter'; predicate: Predicate }
  | { kind: 'recursive'; nextStep: Step | null }

/** 表达式词法/语法错误。 */
class QueryParseError extends Error {
  readonly position: number

  constructor(message: string, position: number) {
    super(message)
    this.name = 'QueryParseError'
    this.position = position
  }
}

/** 递归下降访问节点数超限。 */
class VisitLimitError extends Error {
  constructor() {
    super('visit limit exceeded')
    this.name = 'VisitLimitError'
  }
}

function isIdentifierStart(ch: string | undefined): boolean {
  return ch !== undefined && /[A-Za-z_$\u4e00-\u9fff]/.test(ch)
}

function isIdentifierChar(ch: string | undefined): boolean {
  return ch !== undefined && /[A-Za-z0-9_$\u4e00-\u9fff]/.test(ch)
}

function readIdentifier(expr: string, start: number): { name: string; next: number } {
  let i = start
  while (i < expr.length && isIdentifierChar(expr[i])) i += 1
  return { name: expr.slice(start, i), next: i }
}

/** 读取从 `[` 起到匹配 `]` 的内容（正确处理引号与嵌套中括号）。 */
function readBracket(expr: string, start: number): { inner: string; next: number } {
  let i = start + 1
  let depth = 1
  let quote = ''
  let inner = ''

  while (i < expr.length) {
    const ch = expr[i]
    if (quote !== '') {
      inner += ch
      if (ch === '\\') {
        inner += expr[i + 1] ?? ''
        i += 2
        continue
      }
      if (ch === quote) quote = ''
      i += 1
      continue
    }
    if (ch === '\'' || ch === '"') {
      quote = ch
      inner += ch
      i += 1
      continue
    }
    if (ch === '[') {
      depth += 1
      inner += ch
      i += 1
      continue
    }
    if (ch === ']') {
      depth -= 1
      if (depth === 0) return { inner, next: i + 1 }
      inner += ch
      i += 1
      continue
    }
    inner += ch
    i += 1
  }

  throw new QueryParseError('方括号未闭合', start)
}

function parseIndex(text: string): number {
  const value = Number(text)
  if (!Number.isInteger(value)) throw new QueryParseError(`无效的数组下标「${text}」`, 0)
  return value
}

function parseOptionalIndex(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed.length === 0) return null
  return parseIndex(trimmed)
}

function parseStringList(text: string): string[] {
  const keys: string[] = []
  let i = 0
  while (i < text.length) {
    while (i < text.length && (text[i] === ',' || /\s/.test(text[i]))) i += 1
    if (i >= text.length) break
    const quote = text[i]
    if (quote !== '\'' && quote !== '"') throw new QueryParseError('联合键名需使用引号包裹', 0)
    i += 1
    let value = ''
    while (i < text.length && text[i] !== quote) {
      if (text[i] === '\\') {
        value += text[i + 1] ?? ''
        i += 2
        continue
      }
      value += text[i]
      i += 1
    }
    i += 1
    keys.push(value)
  }
  return keys
}

/** 过滤器谓词解析器（递归下降）。 */
class PredicateParser {
  private readonly src: string
  private pos = 0

  constructor(src: string) {
    this.src = src
  }

  parse(): Predicate {
    const predicate = this.parseOr()
    this.skipSpaces()
    if (this.pos < this.src.length) this.fail('过滤器表达式存在无法解析的内容')
    return predicate
  }

  private skipSpaces(): void {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos += 1
  }

  private fail(message: string): never {
    throw new QueryParseError(message, this.pos)
  }

  private parseOr(): Predicate {
    const parts: Predicate[] = [this.parseAnd()]
    while (true) {
      this.skipSpaces()
      if (!this.src.startsWith('||', this.pos)) break
      this.pos += 2
      parts.push(this.parseAnd())
    }
    return parts.length === 1 ? parts[0] : { kind: 'or', parts }
  }

  private parseAnd(): Predicate {
    const parts: Predicate[] = [this.parseCompare()]
    while (true) {
      this.skipSpaces()
      if (!this.src.startsWith('&&', this.pos)) break
      this.pos += 2
      parts.push(this.parseCompare())
    }
    return parts.length === 1 ? parts[0] : { kind: 'and', parts }
  }

  private parseCompare(): Predicate {
    const left = this.parseOperand()
    this.skipSpaces()
    const op = this.parseOperator()
    if (op === null) this.fail('过滤器需要一个比较运算符（== != < <= > >=）')
    const right = this.parseOperand()
    return { kind: 'compare', left, op, right }
  }

  private parseOperator(): CompareOp | null {
    const two = this.src.slice(this.pos, this.pos + 2)
    if (two === '==' || two === '!=' || two === '<=' || two === '>=') {
      this.pos += 2
      return two
    }
    const one = this.src[this.pos]
    if (one === '<' || one === '>') {
      this.pos += 1
      return one
    }
    return null
  }

  private parseOperand(): Operand {
    this.skipSpaces()
    const ch = this.src[this.pos]
    if (ch === '@' || ch === '$') {
      this.pos += 1
      const segments: string[] = []
      while (this.src[this.pos] === '.') {
        this.pos += 1
        const ident = readIdentifier(this.src, this.pos)
        if (ident.name.length === 0) this.fail('路径缺少字段名')
        segments.push(ident.name)
        this.pos = ident.next
      }
      return { kind: 'path', segments }
    }
    if (ch === '\'' || ch === '"') {
      return { kind: 'string', value: this.readString(ch) }
    }
    if (ch === '-' || (ch !== undefined && /\d/.test(ch))) {
      return { kind: 'number', value: this.readNumber() }
    }
    const word = readIdentifier(this.src, this.pos)
    if (word.name === 'true' || word.name === 'false') {
      this.pos = word.next
      return { kind: 'boolean', value: word.name === 'true' }
    }
    this.fail('无法解析的过滤器操作数')
  }

  private readString(quote: string): string {
    this.pos += 1
    let result = ''
    while (this.pos < this.src.length) {
      const ch = this.src[this.pos]
      if (ch === '\\') {
        result += this.src[this.pos + 1] ?? ''
        this.pos += 2
        continue
      }
      if (ch === quote) {
        this.pos += 1
        return result
      }
      result += ch
      this.pos += 1
    }
    this.fail('字符串字面量未闭合')
  }

  private readNumber(): number {
    const start = this.pos
    if (this.src[this.pos] === '-') this.pos += 1
    while (this.pos < this.src.length && /[0-9.]/.test(this.src[this.pos])) this.pos += 1
    const value = Number(this.src.slice(start, this.pos))
    if (Number.isNaN(value)) this.fail('无效的数字字面量')
    return value
  }
}

function parsePredicate(text: string): Predicate {
  return new PredicateParser(text).parse()
}

function parseBracketInner(inner: string, allowFilter: boolean, emptyAsWildcard: boolean): Step {
  const text = inner.trim()
  if (text.length === 0) {
    if (emptyAsWildcard) return { kind: 'wildcard' }
    throw new QueryParseError('方括号内不能为空', 0)
  }

  if (text === '*') return { kind: 'wildcard' }

  if (text.startsWith('?')) {
    if (!allowFilter) throw new QueryParseError('当前模式不支持过滤器', 0)
    let body = text.slice(1).trim()
    if (body.startsWith('(') && body.endsWith(')')) body = body.slice(1, -1)
    return { kind: 'filter', predicate: parsePredicate(body) }
  }

  if (text.startsWith('\'') || text.startsWith('"')) {
    const keys = parseStringList(text)
    if (keys.length <= 1) return { kind: 'field', name: keys[0] ?? '' }
    return { kind: 'unionKey', keys }
  }

  if (text.includes(':')) {
    const [startText, endText] = text.split(':')
    return { kind: 'slice', start: parseOptionalIndex(startText), end: parseOptionalIndex(endText) }
  }

  if (text.includes(',')) {
    return { kind: 'unionIndex', indices: text.split(',').map((part) => parseIndex(part.trim())) }
  }

  return { kind: 'index', index: parseIndex(text) }
}

/** 解析方括号选择器，并把内部错误位置近似归一化到方括号起点。 */
function parseBracketStep(
  expr: string,
  bracketStart: number,
  allowFilter: boolean,
  emptyAsWildcard: boolean,
): { step: Step; next: number } {
  const bracket = readBracket(expr, bracketStart)
  try {
    return { step: parseBracketInner(bracket.inner, allowFilter, emptyAsWildcard), next: bracket.next }
  } catch (error) {
    if (error instanceof QueryParseError) throw new QueryParseError(error.message, bracketStart)
    throw error
  }
}

function parseJsonPath(expr: string): Step[] {
  const steps: Step[] = []
  let i = 0
  const skipWs = (): void => {
    while (i < expr.length && /\s/.test(expr[i])) i += 1
  }

  skipWs()
  if (expr[i] !== '$') throw new QueryParseError('JSONPath 表达式需以 $ 开头', i)
  i += 1

  while (true) {
    skipWs()
    if (i >= expr.length) break
    const ch = expr[i]

    if (ch === '.') {
      i += 1
      if (expr[i] === '.') {
        i += 1
        if (expr[i] === '*') {
          i += 1
          steps.push({ kind: 'recursive', nextStep: { kind: 'wildcard' } })
          continue
        }
        if (expr[i] === '[') {
          const parsed = parseBracketStep(expr, i, true, false)
          i = parsed.next
          steps.push({ kind: 'recursive', nextStep: parsed.step })
          continue
        }
        if (isIdentifierStart(expr[i])) {
          const ident = readIdentifier(expr, i)
          i = ident.next
          steps.push({ kind: 'recursive', nextStep: { kind: 'field', name: ident.name } })
          continue
        }
        steps.push({ kind: 'recursive', nextStep: null })
        continue
      }
      if (expr[i] === '*') {
        i += 1
        steps.push({ kind: 'wildcard' })
        continue
      }
      if (isIdentifierStart(expr[i])) {
        const ident = readIdentifier(expr, i)
        i = ident.next
        steps.push({ kind: 'field', name: ident.name })
        continue
      }
      throw new QueryParseError('“.” 后应为字段名、* 或 [', i)
    }

    if (ch === '[') {
      const parsed = parseBracketStep(expr, i, true, false)
      i = parsed.next
      steps.push(parsed.step)
      continue
    }

    throw new QueryParseError(`无法识别的字符「${ch}」`, i)
  }

  return steps
}

function parseJqPath(expr: string): Step[] {
  const steps: Step[] = []
  let i = 0
  const skipWs = (): void => {
    while (i < expr.length && /\s/.test(expr[i])) i += 1
  }

  skipWs()
  if (expr[i] !== '.') throw new QueryParseError('jq 路径需以 . 开头', i)

  while (i < expr.length) {
    skipWs()
    if (i >= expr.length) break
    const ch = expr[i]

    if (ch === '.') {
      i += 1
      if (i >= expr.length) break
      if (expr[i] === '[') {
        const parsed = parseBracketStep(expr, i, false, true)
        i = parsed.next
        steps.push(parsed.step)
        continue
      }
      if (expr[i] === '*') {
        i += 1
        steps.push({ kind: 'wildcard' })
        continue
      }
      if (isIdentifierStart(expr[i])) {
        const ident = readIdentifier(expr, i)
        i = ident.next
        steps.push({ kind: 'field', name: ident.name })
        continue
      }
      throw new QueryParseError('“.” 后应为字段名或 [', i)
    }

    if (ch === '[') {
      const parsed = parseBracketStep(expr, i, false, true)
      i = parsed.next
      steps.push(parsed.step)
      continue
    }

    if (ch === '?') {
      // 可选操作符：求值器本身容错，这里仅吞掉标记。
      i += 1
      continue
    }

    throw new QueryParseError(`无法识别的字符「${ch}」`, i)
  }

  return steps
}

/** 按顶层 `|` 拆分 jq 管道（忽略引号与方括号内的 `|`）。 */
function splitPipelines(expr: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  let quote = ''

  for (let i = 0; i < expr.length; i += 1) {
    const ch = expr[i]
    if (quote !== '') {
      current += ch
      if (ch === '\\') {
        current += expr[i + 1] ?? ''
        i += 1
        continue
      }
      if (ch === quote) quote = ''
      continue
    }
    if (ch === '\'' || ch === '"') {
      quote = ch
      current += ch
      continue
    }
    if (ch === '[') {
      depth += 1
      current += ch
      continue
    }
    if (ch === ']') {
      depth -= 1
      current += ch
      continue
    }
    if (ch === '|' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += ch
  }

  parts.push(current)
  return parts
}

interface VisitCounter {
  count: number
}

function bump(counter: VisitCounter): void {
  counter.count += 1
  if (counter.count > MAX_VISIT_NODES) throw new VisitLimitError()
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function childrenOf(node: unknown): unknown[] {
  if (Array.isArray(node)) return node
  if (isPlainObject(node)) return Object.values(node)
  return []
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function resolveSliceIndex(index: number | null, length: number, fallback: number): number {
  if (index === null) return fallback
  return clamp(index < 0 ? length + index : index, 0, length)
}

function collectDescendants(node: unknown, out: unknown[], counter: VisitCounter): void {
  bump(counter)
  out.push(node)
  for (const child of childrenOf(node)) collectDescendants(child, out, counter)
}

function looseEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (typeof left === 'number' && typeof right === 'string') return left === Number(right)
  if (typeof left === 'string' && typeof right === 'number') return Number(left) === right
  return false
}

function compareOrdered(left: number, op: '==' | '!=' | '<' | '<=' | '>' | '>=', right: number): boolean {
  switch (op) {
    case '<':
      return left < right
    case '<=':
      return left <= right
    case '>':
      return left > right
    case '>=':
      return left >= right
    default:
      return false
  }
}

function compareValues(left: unknown, op: CompareOp, right: unknown): boolean {
  if (op === '==') return looseEqual(left, right)
  if (op === '!=') return !looseEqual(left, right)
  if (typeof left === 'number' && typeof right === 'number') return compareOrdered(left, op, right)
  if (typeof left === 'string' && typeof right === 'string') {
    const order = left < right ? -1 : left > right ? 1 : 0
    return compareOrdered(order, op, 0)
  }
  return false
}

function resolveOperand(operand: Operand, node: unknown): unknown {
  if (operand.kind !== 'path') return operand.value
  let current: unknown = node
  for (const segment of operand.segments) {
    if (isPlainObject(current) && Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment]
      continue
    }
    if (Array.isArray(current)) {
      const index = Number(segment)
      current = Number.isInteger(index) && index >= 0 && index < current.length ? current[index] : undefined
      continue
    }
    return undefined
  }
  return current
}

function matchesPredicate(predicate: Predicate, node: unknown): boolean {
  switch (predicate.kind) {
    case 'or':
      return predicate.parts.some((part) => matchesPredicate(part, node))
    case 'and':
      return predicate.parts.every((part) => matchesPredicate(part, node))
    case 'compare':
      return compareValues(resolveOperand(predicate.left, node), predicate.op, resolveOperand(predicate.right, node))
  }
}

function applyStep(nodes: unknown[], step: Step, counter: VisitCounter): unknown[] {
  const out: unknown[] = []

  for (const node of nodes) {
    bump(counter)
    switch (step.kind) {
      case 'field': {
        if (isPlainObject(node) && Object.prototype.hasOwnProperty.call(node, step.name)) out.push(node[step.name])
        break
      }
      case 'wildcard': {
        for (const child of childrenOf(node)) {
          bump(counter)
          out.push(child)
        }
        break
      }
      case 'index': {
        if (Array.isArray(node)) {
          const index = step.index < 0 ? node.length + step.index : step.index
          if (index >= 0 && index < node.length) out.push(node[index])
        }
        break
      }
      case 'slice': {
        if (Array.isArray(node)) {
          const start = resolveSliceIndex(step.start, node.length, 0)
          const end = resolveSliceIndex(step.end, node.length, node.length)
          if (end > start) out.push(...node.slice(start, end))
        }
        break
      }
      case 'unionIndex': {
        if (Array.isArray(node)) {
          for (const raw of step.indices) {
            const index = raw < 0 ? node.length + raw : raw
            if (index >= 0 && index < node.length) out.push(node[index])
          }
        }
        break
      }
      case 'unionKey': {
        if (isPlainObject(node)) {
          for (const key of step.keys) {
            if (Object.prototype.hasOwnProperty.call(node, key)) out.push(node[key])
          }
        }
        break
      }
      case 'filter': {
        if (Array.isArray(node)) {
          for (const item of node) {
            bump(counter)
            if (matchesPredicate(step.predicate, item)) out.push(item)
          }
        }
        break
      }
      case 'recursive': {
        const descendants: unknown[] = []
        collectDescendants(node, descendants, counter)
        if (step.nextStep === null) {
          out.push(...descendants)
        } else {
          out.push(...applyStep(descendants, step.nextStep, counter))
        }
        break
      }
    }
  }

  return out
}

function applySteps(nodes: unknown[], steps: Step[], counter: VisitCounter): unknown[] {
  let current = nodes
  for (const step of steps) {
    current = applyStep(current, step, counter)
    if (current.length === 0) break
  }
  return current
}

export function evaluateQuery(doc: unknown, expr: string, mode: QueryMode): EvaluateResult {
  const trimmed = expr.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: { message: '请输入查询表达式', position: 0 } }
  }

  let pipelines: Step[][]
  try {
    pipelines =
      mode === 'jsonpath' ? [parseJsonPath(trimmed)] : splitPipelines(trimmed).map((segment) => parseJqPath(segment))
  } catch (error) {
    if (error instanceof QueryParseError) {
      return { ok: false, error: { message: error.message, position: error.position } }
    }
    return { ok: false, error: { message: '表达式解析失败', position: 0 } }
  }

  const counter: VisitCounter = { count: 0 }
  try {
    let current: unknown[] = [doc]
    for (const steps of pipelines) {
      current = applySteps(current, steps, counter)
    }
    const matches = current.filter((item) => item !== undefined)
    return { ok: true, result: { matches, count: matches.length } }
  } catch (error) {
    if (error instanceof VisitLimitError) {
      return {
        ok: false,
        error: { message: `查询访问节点数超过 ${MAX_VISIT_NODES}，请缩小查询范围`, position: 0 },
      }
    }
    if (error instanceof QueryParseError) {
      return { ok: false, error: { message: error.message, position: error.position } }
    }
    return { ok: false, error: { message: '查询执行失败，请检查表达式', position: 0 } }
  }
}
