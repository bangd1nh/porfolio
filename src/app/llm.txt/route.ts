import { NextResponse } from "next/server"

import { LLMS_TXT_PATH } from "@/lib/llms-txt"

export function GET(request: Request) {
  return NextResponse.redirect(new URL(LLMS_TXT_PATH, request.url), 308)
}
