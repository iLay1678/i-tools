import { decrypt, getParams } from '@/utils/decode'

interface TokenResponseEncrypt {
  data: {
    ciphertext: string
    iv: string
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const refresh_token = url.searchParams.get('refresh_token')
  const refresh_ui = url.searchParams.get('refresh_ui')
  return handleRequest(refresh_token || refresh_ui || '')
}

export async function POST(request: Request) {
  const { refresh_token, refresh_ui } = await request.json()
  return handleRequest(refresh_token || refresh_ui || '')
}

async function handleRequest(refresh_token: string) {
  try {
    if (!refresh_token) {
      throw new Error('Empty refresh token')
    }

    const t = Math.floor(Date.now() / 1000)
    const sendData = { 
      ...getParams(t), 
      refresh_token,
      "Content-Type": "application/json" 
    }
    
    const headers = Object.fromEntries(
      Object.entries(sendData).map(([k, v]) => [k, String(v)])
    )

    const tokenResponse = await fetch('https://api.extscreen.com/aliyundrive/v3/token', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(sendData)
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh token')
    }

    const tokenData: TokenResponseEncrypt = await tokenResponse.json()
    const plainData = decrypt(tokenData.data.ciphertext, tokenData.data.iv, t)
    const tokenInfo = JSON.parse(plainData)

    return Response.json({
      token_type: 'Bearer',
      access_token: tokenInfo.access_token,
      refresh_token: tokenInfo.refresh_token,
      expires_in: tokenInfo.expires_in
    })
    
  } catch (error: any) {
    return Response.json(
      {
        code: 500,
        message: error.message,
        data: null
      },
      { status: 500 }
    )
  }
}
