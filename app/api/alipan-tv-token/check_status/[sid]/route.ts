import { decrypt, getParams } from "@/utils/decode";

interface QrCodeStatus {
  status: "WaitLogin" | "LoginSuccess" | "QRCodeExpired" | "ScanSuccess" | "LoginFailed"
  authCode?: string
}

interface TokenResponseEncrypt {
  data: {
    ciphertext: string
    iv: string
  }
}

interface TokenRequest {
  akv: string
  apv: string
  b: string
  d: string
  m: string
  mac: string
  n: string
  t: number
  wifiMac: string
  code?: string
  "Content-Type": string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sid: string }> },
) {
  try {
    const { sid } = await params;
    
    const statusResponse = await fetch(`https://openapi.alipan.com/oauth/qrcode/${sid}/status`);
    
    if (!statusResponse.ok) {
      throw new Error("Failed to check status");
    }
    
    const statusData: QrCodeStatus = await statusResponse.json();
    
    if (statusData.status === "LoginSuccess" && statusData.authCode) {
      try {
        const t = Math.floor(Date.now() / 1000);
        const sendData: TokenRequest = { 
          ...getParams(t), 
          code: statusData.authCode, 
          "Content-Type": "application/json", 
        } as TokenRequest;

        const headers = Object.fromEntries(
          Object.entries(sendData).map(([k, v]) => [k, String(v)]),
        );

        const tokenResponse = await fetch("https://api.extscreen.com/aliyundrive/v3/token", {
          method: "POST",
          headers: headers,
          body: JSON.stringify(sendData),
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to get token");
        }

        const tokenResult: TokenResponseEncrypt = await tokenResponse.json();
        const plainData = decrypt(tokenResult.data.ciphertext, tokenResult.data.iv, t);
        const tokenInfo = JSON.parse(plainData);

        return Response.json({
          status: "LoginSuccess",
          refresh_token: tokenInfo.refresh_token,
          access_token: tokenInfo.access_token,
        });

      } catch {
        return Response.json({ status: "LoginFailed" });
      }
    }
    
    return Response.json(statusData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: message },
      { status: 500 },
    );
  }
}
