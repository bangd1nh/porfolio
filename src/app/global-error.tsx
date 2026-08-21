"use client"

import { useEffect } from "react"

import { ErrorExperience } from "@/components/organisms/error-experience"
import "./globals.css"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
  unstable_retry?: () => void
}

export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-full">
        <title>500 — System fault</title>
        <ErrorExperience
          code="500"
          digest={error.digest}
          onRetry={unstable_retry ?? reset}
          syncDocument
        />
      </body>
    </html>
  )
}
