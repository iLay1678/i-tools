import { getClockData, jsonResponse, optionsResponse, toErrorBody } from '@/lib/toolbox'

export const runtime = 'edge'

export function GET(request: Request) {
  try {
    return jsonResponse(getClockData(undefined, request.headers))
  } catch (error) {
    return jsonResponse(toErrorBody(error), { status: 500 })
  }
}

export function OPTIONS() {
  return optionsResponse()
}
