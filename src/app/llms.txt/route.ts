import { buildLlmsTxt, markdownResponse } from "@/lib/llms-txt"

export function GET() {
  return markdownResponse(buildLlmsTxt())
}
