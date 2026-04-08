import { getNiceBing, optionsResponse, redirectResponse, jsonResponse, toErrorBody } from '@/lib/toolbox'

export const runtime = 'edge'

export async function GET() {
  try {
    return redirectResponse(await getNiceBing())
  } catch (error) {
    return jsonResponse(toErrorBody(error), { status: 500 })
  }
}

export function OPTIONS() {
  return optionsResponse()
}
