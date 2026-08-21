"use client"

import { Laptop, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const DISMISSED_KEY = "portfolio:desktop-experience-hint-dismissed"
const COMPACT_VIEWPORT = "(max-width: 1023px)"

export function DesktopExperienceHint() {
  const t = useTranslations("site.desktopHint")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const viewport = window.matchMedia(COMPACT_VIEWPORT)

    const syncVisibility = () => {
      if (!viewport.matches) {
        setVisible(false)
        return
      }

      try {
        setVisible(window.localStorage.getItem(DISMISSED_KEY) !== "true")
      } catch {
        setVisible(true)
      }
    }

    syncVisibility()
    viewport.addEventListener("change", syncVisibility)

    return () => viewport.removeEventListener("change", syncVisibility)
  }, [])

  const dismiss = () => {
    setVisible(false)

    try {
      window.localStorage.setItem(DISMISSED_KEY, "true")
    } catch {
      // The hint can still be dismissed for this page view if storage is blocked.
    }
  }

  if (!visible) return null

  return (
    <Alert
      role="status"
      aria-live="polite"
      className="w-full max-w-md justify-self-center md:justify-self-start lg:hidden"
    >
      <Laptop aria-hidden />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription>{t("description")}</AlertDescription>
      <AlertAction>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={t("dismiss")}
          onClick={dismiss}
        >
          <X />
        </Button>
      </AlertAction>
    </Alert>
  )
}
