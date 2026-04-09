import { getSvgPlaceholder, optionsResponse, textResponse, toErrorBody, jsonResponse } from '@/lib/toolbox'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  try {
    const { size } = await params

    return textResponse(getSvgPlaceholder(size), 'image/svg+xml')
  } catch (error) {
    return jsonResponse(toErrorBody(error), { status: 500 })
  }
}

export function OPTIONS() {
  return optionsResponse()
}
