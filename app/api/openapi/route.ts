import { NextResponse } from 'next/server'

export const runtime = 'edge'

const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: '爱拓工具箱 API',
    version: '1.0.0',
    description: '工具箱接口集合，包含时钟、IP 查询、占位图、二维码、Bing 美图等接口。',
  },
  servers: [
    {
      url: '/',
      description: '当前站点',
    },
  ],
  tags: [
    { name: '工具', description: '工具箱接口' },
    { name: '阿里云盘', description: '阿里云盘相关接口' },
  ],
  paths: {
    '/api/toolbox': {
      get: {
        tags: ['工具'],
        summary: '获取接口目录',
        responses: {
          '200': {
            description: '接口目录',
          },
        },
      },
    },
    '/api/clock': {
      get: {
        tags: ['工具'],
        summary: '获取默认时区时钟信息',
        responses: {
          '200': {
            description: '时钟信息',
          },
        },
      },
    },
    '/api/clock/{timezone}': {
      get: {
        tags: ['工具'],
        summary: '按时区获取时钟信息',
        parameters: [
          {
            name: 'timezone',
            in: 'path',
            required: true,
            schema: { type: 'integer', example: 8 },
            description: '时区偏移，例如 8、-5',
          },
        ],
        responses: {
          '200': {
            description: '时钟信息',
          },
        },
      },
    },
    '/api/ip': {
      get: {
        tags: ['工具'],
        summary: '查询当前请求 IP 信息',
        responses: {
          '200': {
            description: 'IP 地理信息',
          },
        },
      },
    },
    '/api/ip/{ip}': {
      get: {
        tags: ['工具'],
        summary: '按 IP 查询地理信息',
        parameters: [
          {
            name: 'ip',
            in: 'path',
            required: true,
            schema: { type: 'string', example: '8.8.8.8' },
            description: 'IPv4 或 IPv6 地址',
          },
        ],
        responses: {
          '200': {
            description: 'IP 地理信息',
          },
        },
      },
    },
    '/api/dog': {
      get: {
        tags: ['工具'],
        summary: '随机舔狗日记',
        responses: {
          '200': {
            description: '随机文案',
          },
        },
      },
    },
    '/api/svg/{size}': {
      get: {
        tags: ['工具'],
        summary: '生成占位 SVG',
        parameters: [
          {
            name: 'size',
            in: 'path',
            required: true,
            schema: { type: 'string', example: '200x200' },
            description: '尺寸格式支持 200x200、200*200、200_200',
          },
        ],
        responses: {
          '200': {
            description: 'SVG 图片',
            content: {
              'image/svg+xml': {},
            },
          },
        },
      },
    },
    '/api/qrcode/{content}': {
      get: {
        tags: ['工具'],
        summary: '生成二维码 PNG',
        parameters: [
          {
            name: 'content',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'hello' },
            description: '二维码内容，建议 URL 编码',
          },
        ],
        responses: {
          '200': {
            description: 'PNG 图片',
            content: {
              'image/png': {},
            },
          },
        },
      },
    },
    '/api/nicebing': {
      get: {
        tags: ['工具'],
        summary: '跳转到今日 Bing 美图',
        responses: {
          '302': {
            description: '重定向到图片地址',
          },
        },
      },
    },
    '/api/nicebing/{type}': {
      get: {
        tags: ['工具'],
        summary: '按类型跳转 Bing 美图',
        parameters: [
          {
            name: 'type',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['today', 'random'],
              example: 'today',
            },
            description: 'today 或 random',
          },
        ],
        responses: {
          '302': {
            description: '重定向到图片地址',
          },
        },
      },
    },
    '/api/alipan-tv-token/generate_qr': {
      post: {
        tags: ['阿里云盘'],
        summary: '获取阿里云盘 TV 登录二维码',
        responses: {
          '200': {
            description: '返回二维码链接与 sid',
          },
        },
      },
    },
    '/api/alipan-tv-token/check_status/{sid}': {
      get: {
        tags: ['阿里云盘'],
        summary: '查询阿里云盘 TV 登录状态',
        parameters: [
          {
            name: 'sid',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'demo-sid' },
            description: '二维码登录会话 sid',
          },
        ],
        responses: {
          '200': {
            description: '登录状态或 access_token/refresh_token',
          },
        },
      },
    },
    '/api/oauth/alipan/token': {
      get: {
        tags: ['阿里云盘'],
        summary: '通过 refresh_ui 查询阿里云盘 token',
        parameters: [
          {
            name: 'refresh_ui',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: '阿里云盘 refresh token',
          },
        ],
        responses: {
          '200': {
            description: '返回 access_token 与 refresh_token',
          },
        },
      },
      post: {
        tags: ['阿里云盘'],
        summary: '通过 refresh_token 刷新阿里云盘 token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refresh_token'],
                properties: {
                  refresh_token: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: '返回 Bearer token 信息',
          },
        },
      },
    },
  },
} as const

export function GET() {
  return NextResponse.json(openApiDocument)
}
