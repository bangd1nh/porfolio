"use client"

import { useLocale, useTranslations } from "next-intl"
import { useGlobalLoader } from "@/components/providers/global-loader"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("localeSwitcher")
  const { startLoader } = useGlobalLoader()

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return

    startLoader()
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <div role="group" aria-label={t("label")} className="grid grid-flow-col gap-0.5">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          aria-current={locale === loc ? "true" : undefined}
          className={cn(
            "cursor-pointer rounded-none px-3 py-1.5 text-xs font-semibold tracking-wider uppercase",
            "transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            locale === loc
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  )
}
