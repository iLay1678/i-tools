// WiFi / vCard / SMS 二维码载荷拼接与转义（纯函数，零依赖）。
// 契约见设计文档 §3.10，载荷格式见 PRD §5.4。风格：单引号 + 无分号。

export type QrMode = 'wifi' | 'vcard' | 'sms'
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass'

export interface WifiPayloadInput {
  ssid: string
  password: string
  encryption: WifiEncryption
  hidden: boolean
}

export interface VCardPayloadInput {
  name: string
  phone: string
  email: string
  company: string
  title: string
  url: string
  note: string
}

export interface SmsPayloadInput {
  phone: string
  message: string
}

export interface PayloadResult {
  text: string
  escaped: boolean
}

/** 转义 WiFi 载荷中的 \ ; , : "（反斜杠优先）。 */
export function escapeWifiValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/([;,":])/g, '\\$1')
}

export function buildWifiPayload(input: WifiPayloadInput): PayloadResult {
  const hasPassword = input.encryption !== 'nopass' && input.password.length > 0
  const ssid = escapeWifiValue(input.ssid)
  const password = escapeWifiValue(input.password)

  let segments = `WIFI:T:${input.encryption};S:${ssid};`
  if (hasPassword) segments += `P:${password};`
  if (input.hidden) segments += 'H:true;'
  segments += ';'

  const escaped = ssid !== input.ssid || password !== input.password
  return { text: segments, escaped }
}

/** 转义 vCard 字段值中的换行与分隔符。 */
function escapeVCardValue(value: string): string {
  return value.replace(/\r?\n/g, '\\n').replace(/([;,])/g, '\\$1')
}

export function buildVCardPayload(input: VCardPayloadInput): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']
  lines.push(`FN:${escapeVCardValue(input.name)}`)
  if (input.company.length > 0) lines.push(`ORG:${escapeVCardValue(input.company)}`)
  if (input.title.length > 0) lines.push(`TITLE:${escapeVCardValue(input.title)}`)
  if (input.phone.length > 0) lines.push(`TEL:${escapeVCardValue(input.phone)}`)
  if (input.email.length > 0) lines.push(`EMAIL:${escapeVCardValue(input.email)}`)
  if (input.url.length > 0) lines.push(`URL:${escapeVCardValue(input.url)}`)
  if (input.note.length > 0) lines.push(`NOTE:${escapeVCardValue(input.note)}`)
  lines.push('END:VCARD')
  return `${lines.join('\r\n')}\r\n`
}

export function buildSmsPayload(input: SmsPayloadInput): string {
  return `SMSTO:${input.phone}:${input.message}`
}
