import { getIpGeo, jsonResponse, optionsResponse, toErrorBody } from '@/lib/toolbox'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ip: string }> }
) {
  try {
    const { ip } = await params

    return jsonResponse((await getIpGeo(ip, request.headers)) as never)
  } catch (error) {
    return jsonResponse(toErrorBody(error), { status: 500 })
  }
}

export function OPTIONS() {
  return optionsResponse()
}
