"use client"

import { Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useId, useState } from "react"

import { LocaleSwitcher } from "@/components/molecules/locale-switcher"
import { NavLink } from "@/components/molecules/nav-link"
import { ThemeToggle } from "@/components/molecules/theme-toggle"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "@/data/site"
import { Link } from "@/i18n/navigation"

export function SiteHeader() {
  const t = useTranslations("site")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  return (
    <header className="site-header-float">
      <div className="grid grid-cols-10 items-center gap-x-[var(--page-col-gap)] border border-border bg-card px-3 py-2.5 md:px-4">
        <Link
          href="/"
          className="font-heading col-span-5 self-center text-base tracking-tight transition-opacity hover:opacity-80 sm:text-lg lg:col-span-2"
          onClick={() => setMenuOpen(false)}
        >
          {t("name")}
        </Link>

        <nav
          aria-label="Main navigation"
          className="col-span-6 hidden grid-flow-col items-center justify-end gap-0.5 self-center lg:grid"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(`nav.${item.labelKey}`)}
            />
          ))}
        </nav>

        <div className="col-span-5 grid grid-flow-col items-center justify-end gap-1.5 self-center lg:col-span-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="min-h-10 min-w-10 rounded-none lg:hidden"
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

          <div className="glass-inset grid grid-flow-col items-center gap-1.5 rounded-none border border-border p-1">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id={menuId}
          aria-label="Mobile navigation"
          className="mt-2 grid gap-1 border border-border bg-card p-2 lg:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="cursor-pointer rounded-none px-4 py-3 text-sm font-medium tracking-wide text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={() => setMenuOpen(false)}
            >
              {t(`nav.${item.labelKey}`)}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
