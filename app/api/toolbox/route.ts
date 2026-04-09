import { getApiIndex, jsonResponse, optionsResponse } from '@/lib/toolbox'

export function GET(request: Request) {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  return jsonResponse(getApiIndex(baseUrl))
}

export function OPTIONS() {
  return optionsResponse()
}
