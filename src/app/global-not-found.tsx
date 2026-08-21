import type { Metadata } from "next"

import { ErrorExperience } from "@/components/organisms/error-experience"
import "./globals.css"

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The requested portfolio page could not be found.",
}

export default function GlobalNotFound() {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-full">
        <ErrorExperience code="404" syncDocument />
      </body>
    </html>
  )
}
