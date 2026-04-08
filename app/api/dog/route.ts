import { getRandomSoul, jsonResponse, optionsResponse, toErrorBody } from '@/lib/toolbox'

export const runtime = 'edge'

export function GET() {
  try {
    return jsonResponse(getRandomSoul())
  } catch (error) {
    return jsonResponse(toErrorBody(error), { status: 500 })
  }
}

export function OPTIONS() {
  return optionsResponse()
}
