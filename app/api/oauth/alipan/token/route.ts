import { decrypt, getParams } from '@/utils/decode'

interface TokenResponseEncrypt {
  data: {
    ciphertext: string
    iv: string
  }
}

async function refreshToken(refreshTokenValue: string) {
  const t = Math.floor(Date.now() / 1000)

  const sendData = {
    ...getParams(t),
    refresh_token: refreshTokenValue,
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

  return tokenInfo
}

export async function POST(request: Request) {
  try {
    const { refresh_token } = await request.json()
    const tokenInfo = await refreshToken(refresh_token)

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const refresh_ui = searchParams.get('refresh_ui')



    if (!refresh_ui) {
      return Response.json({
        refresh_token: '',
        access_token: '',
        text: 'refresh_ui parameter is required'
      })
    }

    const tokenInfo = await refreshToken(refresh_ui)

    return Response.json({
      refresh_token: tokenInfo.refresh_token,
      access_token: tokenInfo.access_token,
      text: ''
    })

  } catch (error: any) {
    return Response.json({
      refresh_token: '',
      access_token: '',
      text: error.message
    })
  }
}
