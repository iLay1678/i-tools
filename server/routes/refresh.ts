import { decrypt, getParams } from "@/utils/decode";
import { defineEventHandler } from 'h3'

export const runtime = 'edge'

export default defineEventHandler(async (event) => {
  try {
    const { refresh_token } = await readBody(event);
    const t = Math.floor(Date.now() / 1000);
    const sendData = { 
      ...getParams(t), 
      refresh_token: refresh_token,
      "Content-Type": "application/json" 
    };
    
    const headers = Object.fromEntries(
      Object.entries(sendData).map(([k, v]) => [k, String(v)])
    );

    const response = await fetch('http://api.extscreen.com/aliyundrive/v3/token', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(sendData)
    });

    const tokenData :any = await response.json();
    const jsonp = tokenData.data;
    const plainData = decrypt(jsonp.ciphertext, jsonp.iv, t);
    const tokenInfo = JSON.parse(plainData);

    return {
      token_type: 'Bearer',
      access_token: tokenInfo.access_token,
      refresh_token: tokenInfo.refresh_token,
      expires_in: tokenInfo.expires_in
    };
  } catch (error:any) {
    return {
      error: error.message,
      statusCode: 500
    }
  }
})
