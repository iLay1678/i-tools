import QRCode from 'qrcode'

import { souls } from '@/lib/toolbox-souls'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
} as const

export const apiCatalog = [
  {
    api: '/api/clock',
    example: '/api/clock',
    name: '获取时钟信息，默认东八区',
  },
  {
    api: '/api/clock/:timezone',
    example: '/api/clock/8',
    name: '获取时钟信息，默认东八区，可自定义正负时区',
  },
  {
    api: '/api/ip/:ip?',
    example: '/api/ip',
    name: 'IP 地址查询，参数可为空，默认查询当前请求 IP',
  },
  {
    api: '/api/svg/:size',
    example: '/api/svg/200x200',
    name: '生成占位 SVG，默认 200x200',
  },
  {
    api: '/api/dog',
    example: '/api/dog',
    name: '随机舔狗日记',
  },
  {
    api: '/api/qrcode/:content',
    example: '/api/qrcode/hello',
    name: '二维码生成，内容请进行 URL 编码',
  },
  {
    api: '/api/nicebing/:type?',
    example: '/api/nicebing/today',
    name: '获取 Bing 美图，today 为今日图，random 为随机图',
  },
  {
    api: '/api/alipan-tv-token/generate_qr',
    example: '/api/alipan-tv-token/generate_qr',
    name: '获取阿里云盘 TV 登录二维码',
  },
  {
    api: '/api/alipan-tv-token/check_status/:sid',
    example: '/api/alipan-tv-token/check_status/demo-sid',
    name: '查询阿里云盘 TV 登录状态',
  },
  {
    api: '/api/oauth/alipan/token?refresh_ui=:refreshToken',
    example: '/api/oauth/alipan/token?refresh_ui=your-refresh-token',
    name: '通过 refresh token 获取新的阿里云盘 access token',
  },
  {
    api: '/docs',
    example: '/docs',
    name: 'Scalar 在线接口文档',
  },
] as const

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init?.headers,
    },
  })
}

export function textResponse(body: string, contentType: string, init?: ResponseInit) {
  return new Response(body, {
    ...init,
    headers: {
      ...corsHeaders,
      'Content-Type': contentType,
      ...init?.headers,
    },
  })
}

export function redirectResponse(location: string, status = 302) {
  return new Response(location, {
    status,
    headers: {
      ...corsHeaders,
      Location: location,
    },
  })
}

export function getApiIndex(baseUrl: string) {
  return apiCatalog.map((item) => ({
    ...item,
    example: item.example.startsWith('http') ? item.example : `${baseUrl}${item.example}`,
  }))
}

export function getClockData(timezone?: string | number | null, requestHeaders?: Headers) {
  const timezoneNumber = Number.parseInt(String(timezone ?? '8'), 10)
  const offset = Number.isNaN(timezoneNumber) ? 8 : timezoneNumber
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((now.valueOf() - startOfYear.valueOf()) / 86_400_000) + 1
  const weekNumber = Math.ceil(dayOfYear / 7)

  return {
    week_number: weekNumber,
    utc_datetime: now.toISOString(),
    unixtime: now.valueOf(),
    day_of_year: dayOfYear,
    day_of_week: now.getDay(),
    datetime: new Date(now.valueOf() + offset * 3_600_000)
      .toISOString()
      .replace('Z', '')
      .replace('T', ' '),
    client_ip: requestHeaders?.get('cf-connecting-ip') ?? requestHeaders?.get('x-forwarded-for') ?? null,
  }
}

export async function fetchJsonOrText(url: string) {
  const response = await fetch(url, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    next: {
      revalidate: 300,
    },
  })

  const contentType = response.headers.get('content-type') ?? ''

  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status}`)
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function getIpGeo(ip?: string | null, requestHeaders?: Headers) {
  const targetIp = ip || requestHeaders?.get('cf-connecting-ip') || requestHeaders?.get('x-forwarded-for')?.split(',')[0]?.trim()

  if (!targetIp) {
    throw new Error('IP 地址不能为空')
  }

  return fetchJsonOrText(`https://api.ip.sb/geoip/${encodeURIComponent(targetIp)}`)
}

export function getRandomSoul() {
  return {
    code: 200,
    data: souls[Math.floor(Math.random() * souls.length)],
  }
}

export function parseSvgSize(input?: string) {
  const raw = input?.toLowerCase() ?? '200x200'
  let separator = 'x'

  if (raw.includes('*')) {
    separator = '*'
  } else if (raw.includes('_')) {
    separator = '_'
  }

  const [widthText, heightText] = raw.split(separator)
  const width = Number.parseInt(widthText, 10)
  const height = Number.parseInt(heightText, 10)

  return {
    width: Number.isNaN(width) ? 200 : width,
    height: Number.isNaN(height) ? 200 : height,
    separator,
  }
}

export function getSvgPlaceholder(input?: string) {
  const { width, height, separator } = parseSvgSize(input)
  const label = `${width} ${separator} ${height}`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><rect width="${width}" height="${height}" fill="#eee" /><text text-anchor="middle" x="${Math.ceil(width / 2)}" y="${Math.ceil(height / 2)}" style="fill:#aaa;font-weight:bold;font-size:1rem;font-family:Arial,Helvetica,sans-serif;dominant-baseline:central">${label}</text></svg>`
}

export async function getNiceBing(type?: string) {
  if (type === 'random') {
    const result = await fetchJsonOrText('https://bing.open.apith.cn/random') as {
      data?: Array<{ url?: string }>
    }

    const url = result.data?.[0]?.url

    if (!url) {
      throw new Error('未获取到随机 Bing 图片')
    }

    return url.startsWith('http') ? url : `https://${url}`
  }

  const result = await fetchJsonOrText('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&pid=hp&mkt=zh-CN') as {
    images?: Array<{ url?: string }>
  }
  const url = result.images?.[0]?.url

  if (!url) {
    throw new Error('未获取到 Bing 今日图片')
  }

  return url.startsWith('http') ? url : `https://www.bing.com${url}`
}

function base64ToUint8Array(base64: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

export async function getQrcodePng(content: string) {
  const value = content || 'https://api.961678.xyz'
  const dataUrl = await QRCode.toDataURL(value, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256,
  })
  const [, base64] = dataUrl.split(',')

  if (!base64) {
    throw new Error('二维码生成失败')
  }

  return base64ToUint8Array(base64)
}

export function toErrorBody(error: unknown) {
  return {
    error: error instanceof Error ? error.message : 'Unknown error',
  }
}
