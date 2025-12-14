# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

爱拓工具箱 (i-tools) 是一个基于 Next.js 14+ 的在线工具集合平台，提供多种实用工具，包括随机字符串生成器、文字格式化工具、二维码生成、JSON格式化、阿里云盘TV Token获取、挪车码牌生成等功能。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI库**: Ant Design 5
- **语言**: TypeScript
- **样式**: CSS + Ant Design Token
- **部署**: 支持 Vercel、Cloudflare Pages 和 Docker

## 常用命令

```bash
# 安装依赖
pnpm i

# 开发环境运行
pnpm dev

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# Cloudflare部署构建
pnpm deploy

# 静态导出
pnpm export
```

## 项目架构

### 目录结构

```
i-tools/
├── app/                          # Next.js App Router 目录
│   ├── layout.tsx               # 全局布局组件(包含Header/Footer/Ant Design配置)
│   ├── page.tsx                 # 首页(工具列表和分类展示)
│   ├── components/              # 全局共享组件
│   │   ├── AntdProvider.tsx    # Ant Design 提供者
│   │   └── Loading.tsx         # 加载组件
│   ├── utils/                   # 工具函数
│   │   └── decode.ts           # 解码工具
│   ├── api/                     # API路由
│   │   ├── alipan-tv-token/    # 阿里云盘TV Token API
│   │   └── oauth/              # OAuth相关API
│   ├── [工具名]/                # 各个工具页面
│   │   └── page.tsx            # 工具主页面
│   └── globals.css             # 全局样式
├── public/                      # 静态资源
├── next.config.js              # Next.js配置
├── open-next.config.ts         # OpenNext Cloudflare配置
├── tsconfig.json               # TypeScript配置
├── Dockerfile                  # Docker构建文件
└── .github/workflows/          # CI/CD配置
```

### 架构特点

1. **基于 Next.js App Router**: 所有页面都在 `app` 目录下，使用 `page.tsx` 命名约定
2. **Client Components**: 布局和大部分页面使用 `'use client'` 指令，因为需要使用 Ant Design 等客户端交互组件
3. **API Routes**: API路由放在 `app/api/` 目录下，遵循 Next.js 13+ 的路由约定，使用 `route.ts` 文件
4. **全局布局**: `app/layout.tsx` 提供统一的 Header、Footer 和 Ant Design 主题配置

### 工具页面组织方式

每个工具都有自己的目录结构：
- 基本工具: `app/[工具名]/page.tsx`
- 带子页面的工具: `app/[工具名]/page.tsx` 和 `app/[工具名]/[子页面]/page.tsx`

### API 路由规范

- API路由使用 Next.js App Router 的 Route Handler
- 文件命名: `route.ts`
- 支持动态路由: `[参数名]/route.ts`
- 返回格式统一使用 `Response.json()`

### 主题和样式

- 使用 Ant Design ConfigProvider 统一主题配置
- 主题色: `#00d4aa` (Primary)
- 布局使用 Ant Design Layout 组件
- 自定义样式在 `globals.css` 中定义
- 响应式设计: 使用 Ant Design Grid 系统

### 首页工具展示系统

`app/page.tsx` 包含完整的工具展示系统：
- 工具数据结构定义 (Tool interface)
- 分类系统 (categoryConfig)
- 工具列表 (tools array)
- 分类筛选功能

**添加新工具时**，需要在 `tools` 数组中添加新条目，包含：
- id: 工具唯一标识
- title: 工具名称
- description: 工具描述
- icon: Ant Design 图标
- href: 路由路径
- status: 'available' 或 'coming-soon'
- category: 分类标识
- tags: 标签数组
- color: 主题色

### 部署配置

1. **Docker部署**: 使用多阶段构建，基于 Node.js 20 Alpine
2. **Cloudflare部署**: 使用 `@opennextjs/cloudflare` 适配器，配置在 `open-next.config.ts`
3. **Next.js配置**:
   - `output: 'standalone'` 用于 Docker 部署
   - 配置 CORS 头部用于 API 路由
   - ESLint 仅检查特定目录

### TypeScript配置

- 路径别名: `@/*` 映射到 `./app/*`
- 严格模式启用
- 目标: ES2020
- 模块解析: bundler

## 开发注意事项

1. **新增工具**:
   - 在 `app/` 下创建新目录
   - 更新 `app/page.tsx` 中的 `tools` 数组
   - 如需分类，更新 `categoryConfig`

2. **API开发**:
   - 在 `app/api/` 下创建路由文件
   - 使用 TypeScript 类型定义
   - 统一错误处理格式

3. **样式开发**:
   - 优先使用 Ant Design 组件和 Token
   - 自定义样式添加到 `globals.css` 或使用 inline styles
   - 保持响应式设计

4. **CI/CD**:
   - 推送到 main 分支自动触发 Docker 构建
   - 构建多架构镜像 (amd64, arm64)
   - 同时推送到 GHCR 和 Docker Hub
