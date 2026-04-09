interface ApiResponse<T> {
  data: T
}

interface QrCodeData {
  qrCodeUrl: string
  sid: string
}

export async function POST() {
  try {
    const response = await fetch('https://api.extscreen.com/aliyundrive/qrcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scopes: ["user:base", "file:all:read", "file:all:write"].join(','),
        width: 500,
        height: 500,
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate QR code')
    }

    const result: ApiResponse<QrCodeData> = await response.json()
    
    return Response.json({
      qr_link: result.data.qrCodeUrl,
      sid: result.data.sid
    })
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
