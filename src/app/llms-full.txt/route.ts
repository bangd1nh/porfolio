import { buildLlmsFullTxt, markdownResponse } from "@/lib/llms-txt"

export function GET() {
  return markdownResponse(buildLlmsFullTxt())
}
