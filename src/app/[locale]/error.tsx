"use client"

import { useLocale } from "next-intl"
import { useEffect } from "react"

import { ErrorExperience } from "@/components/organisms/error-experience"
import type { Locale } from "@/i18n/routing"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const locale = useLocale() as Locale

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorExperience
      code="500"
      locale={locale}
      digest={error.digest}
      onRetry={reset}
    />
  )
}
