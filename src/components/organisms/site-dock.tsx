"use client"

import { Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useId, useState } from "react"

import { LocaleSwitcher } from "@/components/molecules/locale-switcher"
import { NavLink } from "@/components/molecules/nav-link"
import { ThemeToggle } from "@/components/molecules/theme-toggle"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "@/data/site"
import { useDockVisibility } from "@/hooks/use-dock-visibility"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export function SiteDock() {
  const t = useTranslations("site")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const { visible } = useDockVisibility({ menuOpen })

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  return (
    <header
      className={cn(
        "site-dock",
        visible && "site-dock-visible"
      )}
    >
      {menuOpen ? (
        <nav
          id={menuId}
          aria-label="Mobile navigation"
          className="mb-2 grid gap-1 border border-border bg-card p-2 lg:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(`nav.${item.labelKey}`)}
              className="px-4 py-3 text-foreground"
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      ) : null}

      <div className="grid grid-flow-col items-center gap-2 border border-border bg-card px-3 py-2 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="font-heading shrink-0 text-sm tracking-tight transition-opacity hover:opacity-80 sm:text-base"
          onClick={() => setMenuOpen(false)}
        >
          {t("name")}
        </Link>

        <span
          className="hidden h-4 w-px bg-border lg:block"
          aria-hidden
        />

        <nav
          aria-label="Main navigation"
          className="hidden grid-flow-col items-center gap-0.5 lg:grid"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(`nav.${item.labelKey}`)}
            />
          ))}
        </nav>

        <div className="grid grid-flow-col items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="min-h-9 min-w-9 rounded-none lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t("menuClose") : t("menuOpen")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Menu className="size-4" aria-hidden />
            )}
          </Button>

          <div className="grid grid-flow-col items-center gap-1.5 border border-border p-1">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
