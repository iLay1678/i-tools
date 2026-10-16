// curl 命令 → fetch / axios / python requests 代码生成（纯函数，零依赖，绝不发起网络请求）。
// 契约见设计文档 §3.2。风格：单引号 + 无分号。

export type CurlTarget = 'fetch' | 'axios' | 'python'

export interface CurlRequest {
  method: string // 默认按有无 body 推导 GET/POST
  url: string
  headers: Record<string, string>
  cookies: string[]
  data?: string // 原始 body
  jsonData?: unknown // 尝试 JSON.parse 成功时的对象
  isForm: boolean
  basicAuth?: { user: string; pass: string }
  insecure: boolean
  followRedirects: boolean
  compressed: boolean
}

export interface CurlParseWarning {
  flag: string
  reason: string
}

export type CurlParseResult =
  | { ok: true; request: CurlRequest; warnings: CurlParseWarning[] }
  | { ok: false; error: string; warnings: CurlParseWarning[] }

const MAX_INPUT_LENGTH = 50 * 1024

/** 需要消费一个值的常用参数（未支持者仅提示不参与生成）。 */
const VALUE_FLAGS = new Set([
  '-A',
  '--user-agent',
  '-e',
  '--referer',
  '-o',
  '--output',
  '-m',
  '--max-time',
  '--connect-timeout',
  '--retry',
  '-x',
  '--proxy',
  '--proxy-user',
  '--cacert',
  '--cert',
  '--key',
  '--resolve',
  '--interface',
  '-T',
  '--upload-file',
])

/** 无值布尔参数（识别后忽略，不产生告警）。 */
const BOOLEAN_FLAGS = new Set([
  '-s',
  '--silent',
  '-v',
  '--verbose',
  '-i',
  '--include',
  '-f',
  '--fail',
  '-g',
  '--globoff',
  '--no-keepalive',
  '--raw',
  '-#',
  '--progress-bar',
])

/** 解析 `$'...'` 内的 ANSI-C 转义序列。 */
function decodeAnsiC(input: string, start: number): { text: string; next: number } {
  const ch: string | undefined = input[start + 1]
  switch (ch) {
    case 'n':
      return { text: '\n', next: start + 2 }
    case 't':
      return { text: '\t', next: start + 2 }
    case 'r':
      return { text: '\r', next: start + 2 }
    case '\\':
      return { text: '\\', next: start + 2 }
    case "'":
      return { text: "'", next: start + 2 }
    case '"':
      return { text: '"', next: start + 2 }
    case '0':
      return { text: '\0', next: start + 2 }
    case 'a':
      return { text: '\u0007', next: start + 2 }
    case 'b':
      return { text: '\b', next: start + 2 }
    case 'f':
      return { text: '\f', next: start + 2 }
    case 'v':
      return { text: '\u000b', next: start + 2 }
    case '\n':
      return { text: '', next: start + 2 }
    case undefined:
      return { text: '\\', next: start + 1 }
    default:
      return { text: ch, next: start + 2 }
  }
}

/** 类 shell 分词：支持 `\` 续行、单/双引号与 `$'...'`。 */
function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let hasToken = false
  let i = 0

  const flush = (): void => {
    if (hasToken) {
      tokens.push(current)
      current = ''
      hasToken = false
    }
  }

  while (i < input.length) {
    const ch = input[i]

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      flush()
      i += 1
      continue
    }

    if (ch === '\\') {
      const next: string | undefined = input[i + 1]
      if (next === '\n') {
        i += 2
        continue
      }
      if (next === '\r' && input[i + 2] === '\n') {
        i += 3
        continue
      }
      hasToken = true
      current += next ?? '\\'
      i += 2
      continue
    }

    if (ch === "'") {
      hasToken = true
      i += 1
      while (i < input.length && input[i] !== "'") {
        current += input[i]
        i += 1
      }
      i += 1
      continue
    }

    if (ch === '"') {
      hasToken = true
      i += 1
      while (i < input.length && input[i] !== '"') {
        if (input[i] === '\\') {
          const next: string | undefined = input[i + 1]
          if (next === '"' || next === '\\' || next === '$' || next === '`') {
            current += next
            i += 2
            continue
          }
          if (next === '\n') {
            i += 2
            continue
          }
          current += input[i]
          i += 1
          continue
        }
        current += input[i]
        i += 1
      }
      i += 1
      continue
    }

    if (ch === '$' && input[i + 1] === "'") {
      hasToken = true
      i += 2
      while (i < input.length && input[i] !== "'") {
        if (input[i] === '\\') {
          const decoded = decodeAnsiC(input, i)
          current += decoded.text
          i = decoded.next
          continue
        }
        current += input[i]
        i += 1
      }
      i += 1
      continue
    }

    hasToken = true
    current += ch
    i += 1
  }

  flush()
  return tokens
}

function normalizeUrl(raw: string): string {
  if (raw.length === 0) return raw
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) return raw
  if (raw.startsWith('$') || raw.startsWith('${')) return raw
  return `https://${raw}`
}

function hasJsonBody(data: string | undefined): Record<string, unknown> | unknown[] | undefined {
  if (data === undefined) return undefined
  try {
    const parsed: unknown = JSON.parse(data)
    if (parsed !== null && typeof parsed === 'object') return parsed as Record<string, unknown> | unknown[]
    return undefined
  } catch {
    return undefined
  }
}

export function parseCurl(input: string): CurlParseResult {
  const warnings: CurlParseWarning[] = []
  const trimmed = input.trim()

  if (trimmed.length === 0) {
    return { ok: false, error: '请粘贴 curl 命令', warnings }
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { ok: false, error: 'curl 内容过长（超过 50 KB），请精简后再试', warnings }
  }

  const tokens = tokenize(trimmed)

  let curlIndex = -1
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i].toLowerCase()
    if (token === 'curl' || token === 'curl.exe' || /(^|[/\\])curl(\.exe)?$/.test(token)) {
      curlIndex = i
      break
    }
  }
  if (curlIndex === -1) {
    return { ok: false, error: '未识别为 curl 命令，请以 curl 开头', warnings }
  }

  const args = tokens.slice(curlIndex + 1)

  const headers: Record<string, string> = {}
  const cookies: string[] = []
  let method = ''
  let url = ''
  let data: string | undefined
  let basicAuth: { user: string; pass: string } | undefined
  let compressed = false
  let insecure = false
  let followRedirects = false
  let formDetected = false

  const applyHeader = (rawHeader: string): void => {
    const separator = rawHeader.indexOf(':')
    if (separator === -1) {
      warnings.push({ flag: '-H', reason: `无法解析请求头「${rawHeader}」` })
      return
    }
    const name = rawHeader.slice(0, separator).trim()
    const value = rawHeader.slice(separator + 1).trim()
    if (name.length === 0) {
      warnings.push({ flag: '-H', reason: `无法解析请求头「${rawHeader}」` })
      return
    }
    headers[name] = value
  }

  const applyData = (rawData: string, flag: string): void => {
    if (rawData.startsWith('@')) {
      warnings.push({ flag, reason: '不读取本地文件，请粘贴内容' })
      return
    }
    data = data === undefined ? rawData : `${data}&${rawData}`
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === '-X' || arg === '--request') {
      method = (args[i + 1] ?? '').toUpperCase()
      i += 2
      continue
    }
    if (arg === '-H' || arg === '--header') {
      applyHeader(args[i + 1] ?? '')
      i += 2
      continue
    }
    if (
      arg === '-d' ||
      arg === '--data' ||
      arg === '--data-raw' ||
      arg === '--data-binary' ||
      arg === '--data-urlencode'
    ) {
      applyData(args[i + 1] ?? '', arg)
      i += 2
      continue
    }
    if (arg === '--json') {
      if (!Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) {
        headers['Content-Type'] = 'application/json'
      }
      applyData(args[i + 1] ?? '', arg)
      i += 2
      continue
    }
    if (arg === '-u' || arg === '--user') {
      const credentials = args[i + 1] ?? ''
      const separator = credentials.indexOf(':')
      if (separator === -1) {
        basicAuth = { user: credentials, pass: '' }
      } else {
        basicAuth = { user: credentials.slice(0, separator), pass: credentials.slice(separator + 1) }
      }
      i += 2
      continue
    }
    if (arg === '-b' || arg === '--cookie') {
      const cookie = args[i + 1]
      if (cookie !== undefined && cookie.length > 0) cookies.push(cookie)
      i += 2
      continue
    }
    if (arg === '--compressed') {
      compressed = true
      i += 1
      continue
    }
    if (arg === '-k' || arg === '--insecure') {
      insecure = true
      i += 1
      continue
    }
    if (arg === '-L' || arg === '--location') {
      followRedirects = true
      i += 1
      continue
    }
    if (arg === '--url') {
      url = args[i + 1] ?? url
      i += 2
      continue
    }
    if (arg === '-F' || arg === '--form') {
      formDetected = true
      warnings.push({ flag: arg, reason: 'multipart（-F/--form）暂不支持（P1）' })
      i += 2
      continue
    }
    if (arg === '-A' || arg === '--user-agent') {
      headers['User-Agent'] = args[i + 1] ?? ''
      i += 2
      continue
    }
    if (arg === '-e' || arg === '--referer') {
      headers.Referer = args[i + 1] ?? ''
      i += 2
      continue
    }

    if (arg.startsWith('-') && arg !== '-') {
      if (VALUE_FLAGS.has(arg)) {
        warnings.push({ flag: arg, reason: '该参数暂不支持，已忽略' })
        i += 2
        continue
      }
      if (BOOLEAN_FLAGS.has(arg)) {
        i += 1
        continue
      }
      warnings.push({ flag: arg, reason: '未识别的参数，已忽略' })
      const next = args[i + 1]
      i += next !== undefined && !next.startsWith('-') ? 2 : 1
      continue
    }

    if (url.length === 0) {
      url = arg
    } else {
      warnings.push({ flag: arg, reason: '多余的位置参数，已忽略' })
    }
    i += 1
  }

  if (formDetected) {
    return { ok: false, error: '检测到 multipart（-F/--form），本工具暂不支持，请改用 -d 传表单数据', warnings }
  }

  if (url.length === 0) {
    return { ok: false, error: '未找到请求 URL', warnings }
  }

  const normalizedUrl = normalizeUrl(url)
  const contentType = Object.entries(headers).find(([name]) => name.toLowerCase() === 'content-type')?.[1] ?? ''
  const isForm = contentType.toLowerCase().includes('application/x-www-form-urlencoded')
  const finalMethod = method.length > 0 ? method : data !== undefined ? 'POST' : 'GET'

  return {
    ok: true,
    warnings,
    request: {
      method: finalMethod,
      url: normalizedUrl,
      headers,
      cookies,
      data,
      jsonData: hasJsonBody(data),
      isForm,
      basicAuth,
      insecure,
      followRedirects,
      compressed,
    },
  }
}

function jsString(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')
  return `'${escaped}'`
}

function pyString(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
  return `"${escaped}"`
}

function indentTail(text: string, indent: string): string {
  const lines = text.split('\n')
  if (lines.length <= 1) return text
  return [lines[0], ...lines.slice(1).map((line) => `${indent}${line}`)].join('\n')
}

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

function formToRecord(data: string): Record<string, string> {
  const record: Record<string, string> = {}
  for (const pair of data.split('&')) {
    if (pair.length === 0) continue
    const separator = pair.indexOf('=')
    const key = separator === -1 ? pair : pair.slice(0, separator)
    const value = separator === -1 ? '' : pair.slice(separator + 1)
    record[decodeSafe(key)] = decodeSafe(value)
  }
  return record
}

function finalHeaders(request: CurlRequest): Array<[string, string]> {
  const entries: Array<[string, string]> = Object.entries(request.headers)
  const has = (name: string): boolean => entries.some(([key]) => key.toLowerCase() === name)
  if (request.cookies.length > 0 && !has('cookie')) entries.push(['Cookie', request.cookies.join('; ')])
  if (request.compressed && !has('accept-encoding')) entries.push(['Accept-Encoding', 'gzip, deflate, br'])
  return entries
}

function jsFormExpression(request: CurlRequest): string | null {
  if (request.data === undefined) return null
  if (request.jsonData !== undefined) {
    return `JSON.stringify(${JSON.stringify(request.jsonData, null, 2)})`
  }
  if (request.isForm) {
    const record = formToRecord(request.data)
    const keys = Object.keys(record)
    if (keys.length > 0) {
      const dict = keys.map((key) => `${jsString(key)}: ${jsString(record[key])}`).join(', ')
      return `new URLSearchParams({ ${dict} })`
    }
  }
  return jsString(request.data)
}

function pythonBodyArgs(request: CurlRequest): string[] {
  if (request.data === undefined) return []
  if (request.jsonData !== undefined) {
    return [`json=${indentTail(pythonLiteral(request.jsonData), '    ')}`]
  }
  if (request.isForm) {
    const record = formToRecord(request.data)
    if (Object.keys(record).length > 0) {
      return [`data=${indentTail(pythonLiteral(record), '    ')}`]
    }
  }
  return [`data=${pyString(request.data)}`]
}

/** 将 JSON 兼容值序列化为 Python 字面量。 */
function pythonLiteral(value: unknown): string {
  if (value === null) return 'None'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'None'
  if (typeof value === 'string') return pyString(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((item) => `    ${pythonLiteral(item)}`)
    return `[\n${items.join(',\n')}\n]`
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>)
    if (keys.length === 0) return '{}'
    const items = keys.map((key) => `    ${pyString(key)}: ${pythonLiteral((value as Record<string, unknown>)[key])}`)
    return `{\n${items.join(',\n')}\n}`
  }
  return 'None'
}

export function generateFetch(request: CurlRequest): string {
  const headers = finalHeaders(request)
  const lines: string[] = []

  lines.push(`const response = await fetch(${jsString(request.url)}, {`)
  lines.push(`  method: ${jsString(request.method)},`)
  if (headers.length > 0) {
    lines.push('  headers: {')
    for (const [name, value] of headers) lines.push(`    ${jsString(name)}: ${jsString(value)},`)
    lines.push('  },')
  }
  if (request.followRedirects) lines.push("  redirect: 'follow',")
  const body = jsFormExpression(request)
  if (body !== null) lines.push(`  body: ${body},`)
  lines.push('});')
  lines.push('')
  lines.push('const data = await response.json();')
  lines.push('console.log(data);')
  if (request.insecure) {
    lines.push('')
    lines.push('// 注意：浏览器端无法忽略证书校验；Node.js 环境请自行配置 agent。')
  }
  return lines.join('\n')
}

export function generateAxios(request: CurlRequest): string {
  const headers = finalHeaders(request)
  const lines: string[] = []

  lines.push("import axios from 'axios';")
  lines.push('')
  lines.push('const response = await axios({')
  lines.push(`  method: ${jsString(request.method.toLowerCase())},`)
  lines.push(`  url: ${jsString(request.url)},`)
  if (headers.length > 0) {
    lines.push('  headers: {')
    for (const [name, value] of headers) lines.push(`    ${jsString(name)}: ${jsString(value)},`)
    lines.push('  },')
  }
  let dataExpression: string | null = null
  if (request.data !== undefined) {
    if (request.jsonData !== undefined) {
      dataExpression = JSON.stringify(request.jsonData, null, 2)
    } else if (request.isForm) {
      const record = formToRecord(request.data)
      if (Object.keys(record).length > 0) {
        const dict = Object.keys(record)
          .map((key) => `${jsString(key)}: ${jsString(record[key])}`)
          .join(', ')
        dataExpression = `new URLSearchParams({ ${dict} })`
      }
    }
    if (dataExpression === null) dataExpression = jsString(request.data)
  }
  if (dataExpression !== null) lines.push(`  data: ${dataExpression},`)
  lines.push('});')
  lines.push('')
  lines.push('console.log(response.data);')
  if (request.insecure) {
    lines.push('')
    lines.push('// 注意：Node.js 忽略证书校验需配置 httpsAgent，请按需处理。')
  }
  return lines.join('\n')
}

export function generatePython(request: CurlRequest): string {
  const headers = finalHeaders(request)
  const method = request.method.toLowerCase()
  const supported = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
  const callName = supported.includes(method) ? `requests.${method}` : 'requests.request'

  const lines: string[] = []
  lines.push('import requests')
  lines.push('')
  if (headers.length > 0) {
    lines.push('headers = {')
    for (const [name, value] of headers) lines.push(`    ${pyString(name)}: ${pyString(value)},`)
    lines.push('}')
    lines.push('')
  }

  const args: string[] = []
  if (callName === 'requests.request') args.push(pyString(request.method.toUpperCase()))
  args.push(pyString(request.url))
  if (headers.length > 0) args.push('headers=headers')
  args.push(...pythonBodyArgs(request))
  if (request.basicAuth) {
    args.push(`auth=(${pyString(request.basicAuth.user)}, ${pyString(request.basicAuth.pass)})`)
  }
  if (request.insecure) args.push('verify=False')
  if (request.followRedirects) args.push('allow_redirects=True')

  lines.push(`response = ${callName}(`)
  for (const arg of args) lines.push(`    ${arg},`)
  lines.push(')')
  lines.push('')
  lines.push('print(response.json())')
  return lines.join('\n')
}
