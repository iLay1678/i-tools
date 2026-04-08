import { getNiceBing, optionsResponse, redirectResponse, jsonResponse, toErrorBody } from '@/lib/toolbox'

export const runtime = 'edge'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params

    return redirectResponse(await getNiceBing(type))
  } catch (error) {
    return jsonResponse(toErrorBody(error), { status: 500 })
  }
}

export function OPTIONS() {
  return optionsResponse()
}
