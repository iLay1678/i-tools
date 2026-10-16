// Markdown 表格 ↔ CSV 双向转换（自写 RFC4180 解析器，零依赖）。
// 契约见设计文档 §3.6。风格：单引号 + 无分号。
// 严禁复用 /csv-json 的 split(',') 朴素实现。

export type Delimiter = ',' | '\t'
export type Alignment = 'left' | 'center' | 'right' | 'none'

export interface TableData {
  headers: string[]
  rows: string[][]
  alignments: Alignment[]
}

export interface ParseWarning {
  message: string
}

export interface CsvParseResult {
  rows: string[][]
  warnings: ParseWarning[]
}

export interface MarkdownParseResult {
  table: TableData
  warnings: ParseWarning[]
}

const ALIGNMENT_CELL = /^:?-+:?$/

/** 剥离 UTF-8 BOM。 */
export function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1)
  return text
}

/** RFC4180 合规的 CSV/TSV 解析：支持引号包裹、"" 转义、引号内换行与 CRLF。 */
export function parseCsv(input: string, delimiter: Delimiter): CsvParseResult {
  const text = stripBom(input)
  const rows: string[][] = []
  const warnings: ParseWarning[] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let i = 0

  const endRow = (): void => {
    row.push(field)
    rows.push(row)
    field = ''
    row = []
  }

  while (i < text.length) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }

    if (ch === '"') {
      if (field.length === 0) {
        inQuotes = true
      } else {
        field += ch
      }
      i += 1
      continue
    }

    if (ch === delimiter) {
      row.push(field)
      field = ''
      i += 1
      continue
    }

    if (ch === '\r') {
      if (text[i + 1] === '\n') {
        i += 1
        continue
      }
      endRow()
      i += 1
      continue
    }

    if (ch === '\n') {
      endRow()
      i += 1
      continue
    }

    field += ch
    i += 1
  }

  if (inQuotes) warnings.push({ message: '引号未闭合，已按原文处理' })
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return { rows, warnings }
}

function escapeCsvCell(value: string, delimiter: Delimiter): string {
  if (value.includes('"') || value.includes('\n') || value.includes('\r') || value.includes(delimiter)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** 生成 CSV/TSV 文本（列数以表头为准，不足补空）。 */
export function toCsv(table: TableData, delimiter: Delimiter): string {
  const columnCount = table.headers.length
  const lines: string[] = []

  const renderRow = (cells: string[]): string => {
    const normalized: string[] = []
    for (let index = 0; index < columnCount; index += 1) {
      normalized.push(escapeCsvCell(cells[index] ?? '', delimiter))
    }
    return normalized.join(delimiter)
  }

  if (columnCount > 0) lines.push(renderRow(table.headers))
  for (const row of table.rows) lines.push(renderRow(row))

  return lines.join('\n')
}

/** 按未转义的 `|` 拆分一行 Markdown 表格行。 */
function splitMarkdownRow(line: string): string[] {
  let text = line.trim()
  if (text.startsWith('|')) text = text.slice(1)
  if (text.endsWith('|')) text = text.slice(0, -1)

  const cells: string[] = []
  let current = ''
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '\\' && text[i + 1] === '|') {
      current += '|'
      i += 1
      continue
    }
    if (ch === '|') {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current.trim())
  return cells
}

function parseAlignmentCell(cell: string): Alignment {
  const trimmed = cell.trim()
  if (!ALIGNMENT_CELL.test(trimmed)) return 'none'
  const left = trimmed.startsWith(':')
  const right = trimmed.endsWith(':')
  if (left && right) return 'center'
  if (right) return 'right'
  if (left) return 'left'
  return 'none'
}

function looksLikeTableRow(line: string): boolean {
  return line.trim().includes('|')
}

function isAlignmentRow(line: string): boolean {
  const cells = splitMarkdownRow(line)
  if (cells.length === 0) return false
  return cells.every((cell) => ALIGNMENT_CELL.test(cell.trim()))
}

/** 解析 Markdown 表格文本，容错缺失对齐行、列数不齐。 */
export function parseMarkdownTable(input: string): MarkdownParseResult {
  const warnings: ParseWarning[] = []
  const rawLines = stripBom(input)
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.trim().length > 0)

  const contentLines = rawLines.filter((line) => looksLikeTableRow(line))

  if (contentLines.length === 0) {
    return { table: { headers: [], rows: [], alignments: [] }, warnings: [{ message: '未识别到 Markdown 表格行' }] }
  }

  const headerIndex = rawLines.findIndex((line) => looksLikeTableRow(line) && !isAlignmentRow(line))
  const headerLine = headerIndex >= 0 ? rawLines[headerIndex] : contentLines[0]
  const headers = splitMarkdownRow(headerLine)
  const columnCount = headers.length

  let alignments: Alignment[] = headers.map(() => 'none')
  const nextLine = headerIndex >= 0 ? rawLines[headerIndex + 1] : undefined
  if (nextLine !== undefined && isAlignmentRow(nextLine)) {
    const alignmentCells = splitMarkdownRow(nextLine)
    alignments = headers.map((_, index) => (index < alignmentCells.length ? parseAlignmentCell(alignmentCells[index]) : 'none'))
  } else {
    warnings.push({ message: '未找到对齐行，已按表头推断列数' })
  }

  const rows: string[][] = []
  const dataStart = headerIndex >= 0 ? headerIndex + 1 : 1
  let mismatched = false
  for (let i = dataStart; i < rawLines.length; i += 1) {
    const line = rawLines[i]
    if (isAlignmentRow(line)) continue
    if (!looksLikeTableRow(line)) continue
    const cells = splitMarkdownRow(line)
    if (cells.length !== columnCount) mismatched = true
    const normalized: string[] = []
    for (let column = 0; column < columnCount; column += 1) normalized.push(cells[column] ?? '')
    rows.push(normalized)
  }

  if (mismatched) warnings.push({ message: '行列数不齐，已补空单元格' })

  return { table: { headers, rows, alignments }, warnings }
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
}

function alignmentMarker(alignment: Alignment): string {
  switch (alignment) {
    case 'left':
      return ':---'
    case 'center':
      return ':---:'
    case 'right':
      return '---:'
    default:
      return '---'
  }
}

/** 生成 Markdown 表格文本。 */
export function toMarkdownTable(table: TableData): string {
  const columnCount = table.headers.length
  if (columnCount === 0) return ''

  const renderRow = (cells: string[]): string => {
    const normalized: string[] = []
    for (let index = 0; index < columnCount; index += 1) {
      normalized.push(escapeMarkdownCell(cells[index] ?? ''))
    }
    return `| ${normalized.join(' | ')} |`
  }

  const lines: string[] = [renderRow(table.headers)]
  const markers: string[] = []
  for (let index = 0; index < columnCount; index += 1) {
    markers.push(alignmentMarker(table.alignments[index] ?? 'none'))
  }
  lines.push(`| ${markers.join(' | ')} |`)
  for (const row of table.rows) lines.push(renderRow(row))

  return lines.join('\n')
}

/** 判断某列是否全部为非空数值（用于右对齐推断）。 */
export function isNumericColumn(rows: string[][], columnIndex: number): boolean {
  let found = false
  for (const row of rows) {
    const value = (row[columnIndex] ?? '').trim()
    if (value.length === 0) continue
    if (!Number.isFinite(Number(value))) return false
    found = true
  }
  return found
}
