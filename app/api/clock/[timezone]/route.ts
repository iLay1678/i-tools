import { getClockData, jsonResponse, optionsResponse, toErrorBody } from '@/lib/toolbox'

export function GET(
  request: Request,
  { params }: { params: Promise<{ timezone: string }> }
) {
  return params
    .then(({ timezone }) => jsonResponse(getClockData(timezone, request.headers)))
    .catch((error) => jsonResponse(toErrorBody(error), { status: 500 }))
}

export function OPTIONS() {
  return optionsResponse()
}
