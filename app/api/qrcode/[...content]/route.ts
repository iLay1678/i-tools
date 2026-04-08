import { getQrcodePng, optionsResponse, toErrorBody, jsonResponse } from '@/lib/toolbox'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ content: string[] }> }
) {
  try {
    const { content } = await params
    const png = await getQrcodePng(content.join('/'))

    return new Response(png, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    return jsonResponse(toErrorBody(error), { status: 500 })
  }
}

export function OPTIONS() {
  return optionsResponse()
}
