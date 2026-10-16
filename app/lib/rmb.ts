// 人民币大写金额转换与输入校验（纯函数，零依赖）。
// 契约见设计文档 §3.7，规则见 PRD §5.9。风格：单引号 + 无分号。

export type RmbErrorCode = 'empty' | 'invalid_chars' | 'too_many_decimals' | 'out_of_range' | 'scientific'

export interface RmbError {
  code: RmbErrorCode
  message: string
}

export type RmbResult =
  | { ok: true; uppercase: string; normalized: string; grouped: string }
  | { ok: false; error: RmbError }

export const RMB_MAX = 999999999999.99

const RMB_DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const RMB_UNITS = ['', '拾', '佰', '仟']
const RMB_SECTIONS = ['', '万', '亿', '万亿']

const NORMALIZED_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/

function fail(code: RmbErrorCode, message: string): RmbResult {
  return { ok: false, error: { code, message } }
}

/**
 * 千分位格式化核心 —— 全仓唯一的千分位实现。
 * `toRmbUppercase`（产生 grouped 字段）与 `formatGrouped` 均调用本函数，杜绝两份实现漂移。
 */
function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** 组装带千分位的金额字符串：负数前缀 + 整数分组 + 调用方给定的小数片段（含前导点或空串）。 */
function assembleGrouped(negative: boolean, intPart: string, fraction: string): string {
  return `${negative ? '-' : ''}${groupThousands(intPart)}${fraction}`
}

/** 整数部分转中文大写（连续零合并、节末尾零省略、十位 1 写作壹拾）。 */
function integerToUpper(input: string): string {
  const digits = input.replace(/^0+/, '')
  if (digits.length === 0) return '零'

  const length = digits.length
  let result = ''
  let zeroPending = false
  let sectionNonzero = false
  let currentSection = -1

  for (let i = 0; i < length; i += 1) {
    const digit = Number(digits[i])
    const posFromRight = length - 1 - i
    const unitIndex = posFromRight % 4
    const sectionIndex = Math.floor(posFromRight / 4)

    if (sectionIndex !== currentSection) {
      currentSection = sectionIndex
      sectionNonzero = false
    }

    if (digit === 0) {
      zeroPending = true
    } else {
      if (zeroPending && result.length > 0 && !result.endsWith('零')) result += '零'
      zeroPending = false
      result += RMB_DIGITS[digit] + RMB_UNITS[unitIndex]
      sectionNonzero = true
    }

    if (unitIndex === 0 && sectionIndex > 0 && sectionNonzero) {
      result += RMB_SECTIONS[sectionIndex] ?? ''
    }
  }

  return result
}

export function toRmbUppercase(input: string): RmbResult {
  const raw = input.trim()
  if (raw.length === 0) return fail('empty', '请输入金额')

  const cleaned = raw.replace(/,/g, '')
  if (/[eE]/.test(cleaned)) return fail('scientific', '不支持科学计数法，请输入普通数字')
  if (!NORMALIZED_PATTERN.test(cleaned)) {
    return fail('invalid_chars', '请输入有效数字（仅支持数字、小数点、正负号与千分位逗号）')
  }

  const negative = cleaned.startsWith('-')
  const unsigned = cleaned.replace(/^[+-]/, '')
  const dotIndex = unsigned.indexOf('.')
  const intPartRaw = dotIndex === -1 ? unsigned : unsigned.slice(0, dotIndex)
  const fracPart = dotIndex === -1 ? '' : unsigned.slice(dotIndex + 1)

  if (fracPart.length > 2) return fail('too_many_decimals', '最多保留两位小数（角分），请勿四舍五入')

  const intPart = intPartRaw.replace(/^0+(?=\d)/, '') || '0'
  if (intPart.length > 12) return fail('out_of_range', '超出支持范围（最大 999999999999.99）')

  const value = Number(`${intPart}.${fracPart || '0'}`)
  if (!Number.isFinite(value) || value > RMB_MAX) {
    return fail('out_of_range', '超出支持范围（最大 999999999999.99）')
  }

  const jiao = fracPart.length >= 1 ? Number(fracPart[0]) : 0
  const fen = fracPart.length >= 2 ? Number(fracPart[1]) : 0
  const intUpper = integerToUpper(intPart)

  let body: string
  if (jiao === 0 && fen === 0) {
    body = `${intUpper}元整`
  } else if (fen === 0) {
    body = `${intUpper}元${RMB_DIGITS[jiao]}角`
  } else if (jiao === 0) {
    body = `${intUpper}元零${RMB_DIGITS[fen]}分`
  } else {
    body = `${intUpper}元${RMB_DIGITS[jiao]}角${RMB_DIGITS[fen]}分`
  }

  const uppercase = negative ? `负${body}` : body
  const normalized = `${negative ? '-' : ''}${intPart}${fracPart.length > 0 ? `.${fracPart}` : ''}`
  const grouped = assembleGrouped(negative, intPart, fracPart.length > 0 ? `.${fracPart.padEnd(2, '0')}` : '')

  return { ok: true, uppercase, normalized, grouped }
}

/** 千分位格式化（保留两位小数，整数金额省略 .00）。与 `toRmbUppercase` 共用 groupThousands 唯一实现。 */
export function formatGrouped(value: number): string {
  if (!Number.isFinite(value)) return ''
  const negative = value < 0
  const fixed = Math.abs(value).toFixed(2)
  const [intPart, fracPart] = fixed.split('.')
  const fraction = fracPart === '00' ? '' : `.${fracPart}`
  return assembleGrouped(negative, intPart, fraction)
}
