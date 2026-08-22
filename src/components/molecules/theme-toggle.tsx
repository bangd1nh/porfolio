"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@teispace/next-themes"
import { useTranslations } from "next-intl"
import { useRef, useSyncExternalStore } from "react"

import { useThemeTransition } from "@/hooks/use-theme-transition"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme } = useTheme()
  const { startThemeTransition, isTransitioning } = useThemeTransition()
  const t = useTranslations("theme")
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )
  const buttonRef = useRef<HTMLButtonElement>(null)

  if (!mounted) {
    return <div aria-hidden className="size-8 rounded-none" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={isTransitioning}
      onClick={() => {
        void startThemeTransition({ originElement: buttonRef.current })
      }}
      aria-label={t("toggle")}
      className={cn(
        "grid size-8 cursor-pointer place-items-center rounded-none",
        "text-muted-foreground transition-colors duration-200",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-60"
      )}
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  )
}
