<h1 align="center">爱拓工具箱</h1>

<div align="center">

[![Stars](https://img.shields.io/github/stars/iLay1678/i-tools?style=flat)](https://github.com/iLay1678/i-tools)
![badge](https://cnb.cool/ilay1678/i-tools/-/badge/git/latest/ci/status/tag_push)

</div>



## 功能列表
1. **随机字符串生成器**
   - 生成安全可靠的随机字符串，支持多种字符集配置和批量生成
2. **某云盘TV授权**
   - 获取某网盘TV端的授权令牌
3. **挪车码牌生成**
   - 生成挪车码牌，方便他人联系车主
4. **二维码生成**
   - 生成自定义二维码
5. **JSON格式化工具**
   - JSON处理工具，支持格式化、压缩、验证和统计分析
6. **文字格式化工具**
- 去除复制文本的格式、空格和换行，还原纯净文字内容
7. **敬请期待**
   - 更多工具正在开发中...

## 部署

### 一键部署

#### Vercel 自动部署

<a href="https://vercel.com/new/clone?repository-url=https://github.com/iLay1678/i-tools" target="_blank">
  <img src="https://vercel.com/button" alt="Deploy with Vercel" />
</a>

#### Cloudflare Pages 自动部署

<a href="https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/deploy-to-workers&repository=https://github.com/iLay1678/i-tools" target="_blank">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" />
</a>

#### EdgeOne Pages 自动部署

[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https://github.com/iLay1678/i-tools)


### Docker部署
```
docker run --name=i-tools -d -p 3000:3000 ghcr.io/ilay1678/i-tools:latest 
```
国内镜像
```
docker run --name=i-tools -d -p 3000:3000 docker.cnb.cool/ilay1678/mirrors/i-tools:latest 
```

## 自动同步最近更改

在创建的仓库中启用本仓库自带的 GitHub Actions 自动同步工作流Upstream Sync（见 `.github/workflows/sync.yml`）。

## Stargazers over time
[![Stargazers over time](https://starchart.cc/iLay1678/i-tools.svg?variant=adaptive)](https://starchart.cc/iLay1678/i-tools)