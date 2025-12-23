<h1 align="center">i-Tools | 爱拓工具箱</h1>

<div align="center">

[![Stars](https://img.shields.io/github/stars/iLay1678/i-tools?style=flat)](https://github.com/iLay1678/i-tools)
![badge](https://cnb.cool/ilay1678/i-tools/-/badge/git/latest/ci/status/tag_push)
[![License](https://img.shields.io/github/license/iLay1678/i-tools)](LICENSE)

</div>

<p align="center">
  <strong>简约、高效、现代化的在线开发者工具集合</strong><br/>
  基于 Next.js 16 + Tailwind CSS 4 + TypeScript 构建
</p>

## ✨ 特性

- **现代化设计**：精美的 UI，支持明亮/暗黑模式自适应。
- **高性能**：基于 React Server Components 和静态生成。
- **纯前端处理**：大部分数据处理（如格式化、转换）在本地浏览器完成，保护隐私。
- **全能工具库**：涵盖开发、文本、编码、加密、转换、生成、生活等 40+ 款实用工具。

## 🛠️ 工具列表

### 👨‍💻 开发工具 (Dev Tools)
1.  **JSON 格式化** (`/json-formatter`): 格式化、压缩、验证、Diff 对比。
2.  **YAML 格式化** (`/yaml-formatter`): YAML 校验与美化。
3.  **HTML 格式化** (`/html-formatter`): HTML 代码美化。
4.  **SQL 格式化** (`/sql-formatter`): 支持多种数据库方言的 SQL 美化。
5.  **文本 Diff 对比** (`/diff`): Monaco Editor 驱动并排代码差异对比。
6.  **Markdown 编辑器** (`/markdown`): 实时预览、GFM 支持、导出 Markdown。
7.  **HTML 转义** (`/html-escape`): HTML 实体编码/解码。

### 📝 文本工具 (Text Tools)
1.  **文字格式化** (`/text-formatter`): 中英文盘古之白空格、符号修正。
2.  **大小写转换** (`/case-converter`): 驼峰、蛇形、大写、小写互转。
3.  **Lorem Ipsum** (`/lorem-ipsum`): 生成乱数假文。

### 🔐 加密与编码 (Crypto & Encoding)
1.  **Base64 编解码** (`/base64`): 文本与 Base64 互转。
2.  **URL 编解码** (`/url-encode`): URL 参数编码处理。
3.  **Unicode 转换** (`/unicode`): Unicode 编码转换。
4.  **Base32/Base58** (`/base32`, `/base58`): 其他常用编码。
5.  **MD5/SHA 哈希** (`/hash`): 计算 MD5, SHA1, SHA256, SHA512。
6.  **Bcrypt 哈希** (`/bcrypt`): 生成与验证 Bcrypt 密码哈希。
7.  **AES/DES 加密** (`/aes-des`): 对称加密解密工具。
8.  **JWT 解码** (`/jwt`): JWT Token 解析查看。

### 🎨 图像与可视化 (Visual)
1.  **二维码生成** (`/qrcode`): 自定义颜色、Logo 的二维码生成。
2.  **条形码生成** (`/barcode`): 生成 EAN, UPC, Code128 等条形码。
3.  **ASCII 艺术** (`/ascii-art`): 文字转字符画。
4.  **图片转像素画** (`/image-to-pixel`): 图片像素化风格转换。
5.  **图片 Base64** (`/image-base64`): 图片文件与 Base64 字符串互转。

### 🧮 转换与计算 (Converters & Calc)
1.  **时间戳转换** (`/timestamp`): Unix 时间戳与日期互转。
2.  **进制转换器** (`/radix-converter`): 二/八/十/十六进制任意互转。
3.  **IP 进制转换** (`/ip-radix`): IP 地址与整数/二进制转换。
4.  **IP 子网计算** (`/ip-calc`): CIDR 子网划分计算。
5.  **CSV/JSON 互转** (`/csv-json`): 数据格式互相转换。

### 🎲 生成与随机 (Generation)
1.  **UUID 生成** (`/uuid`): 批量生成 Version 1/4 UUID。
2.  **随机密码生成** (`/random-string`): 高强度随机密码生成器。
3.  **大转盘抽奖** (`/wheel`): 随机决策工具。
4.  **随机分组** (`/random-group`): 名单随机分组工具。
5.  **抛硬币** (`/coin-flip`): 简单的概率工具。

### 🔧 实用工具 (Utilities)
1.  **Cron 解析** (`/cron`): Cron 表达式翻译与执行时间预测。
2.  **正则测试** (`/regex`): 正则表达式实时测试。
3.  **颜色选择器** (`/color-picker`): HEX, RGB, HSL 转换与拾色。
4.  **UA 解析** (`/user-agent`): 解析 User-Agent 字符串详情。
5.  **键盘按键检测** (`/keyboard`): KeyCode 与按键事件查看。
6.  **挪车码牌** (`/move-car`): 生成微信挪车通知码。
7.  **番茄钟/秒表/倒计时**: 时间管理三件套。
8.  **阿里云盘 TV Token**: 扫码获取 Token。

## 💻 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (App Directory)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI 组件**: [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Linting**: [Oxc (Oxlint)](https://github.com/oxc-project/oxc) - 高性能 Linter，替代 ESLint。

## 🚀 快速开始

### 开发

1. 克隆项目
```bash
git clone https://github.com/iLay1678/i-tools.git
cd i-tools
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 代码检查 (使用 Oxc)
```bash
npm run lint
```

### 构建

```bash
npm run build
```

## 📦 部署

### Vercel / Cloudflare / EdgeOne

推荐使用 Vercel 或 Cloudflare Pages 进行一键部署。

<div align="left">
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/iLay1678/i-tools" target="_blank">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" height="32" />
  </a>
  &nbsp;&nbsp;
  <a href="https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/deploy-to-workers&repository=https://github.com/iLay1678/i-tools" target="_blank">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" height="32" />
  </a>
</div>

### Docker 部署

```bash
docker run --name=i-tools -d -p 3000:3000 ghcr.io/ilay1678/i-tools:latest
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT © iLay1678