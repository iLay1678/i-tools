const scalarBundleUrl = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.51.0/dist/browser/standalone.js'
const scalarFallbackUrl = 'https://unpkg.com/@scalar/api-reference@1.51.0/dist/browser/standalone.js'

export function GET() {
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>爱拓工具箱 API 文档</title>
    <style>
      html, body, #app {
        margin: 0;
        width: 100%;
        height: 100%;
      }
      body {
        background: #0f172a;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
      function renderScalar() {
        if (!window.Scalar) return

        window.Scalar.createApiReference('#app', {
          url: '/api/openapi',
          theme: 'laserwave',
          darkMode: false,
        })
      }

      function loadScript(src, onError) {
        var script = document.createElement('script')
        script.src = src
        script.onload = renderScalar
        script.onerror = onError
        document.body.appendChild(script)
      }

      loadScript('${scalarBundleUrl}', function () {
        loadScript('${scalarFallbackUrl}', function () {
          document.getElementById('app').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#fff;font-family:sans-serif;">文档资源加载失败，请稍后重试。</div>'
        })
      })
    </script>
  </body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
