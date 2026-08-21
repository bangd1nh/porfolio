"use client"

import { useLocale } from "next-intl"

import { ErrorExperience } from "@/components/organisms/error-experience"
import type { Locale } from "@/i18n/routing"

export default function NotFound() {
  const locale = useLocale() as Locale

  return <ErrorExperience code="404" locale={locale} />
}
