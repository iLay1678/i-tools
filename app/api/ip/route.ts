import { getIpGeo, jsonResponse, optionsResponse, toErrorBody } from '@/lib/toolbox'

export async function GET(request: Request) {
  try {
    return jsonResponse((await getIpGeo(undefined, request.headers)) as never)
  } catch (error) {
    return jsonResponse(toErrorBody(error), { status: 500 })
  }
}

export function OPTIONS() {
  return optionsResponse()
}
