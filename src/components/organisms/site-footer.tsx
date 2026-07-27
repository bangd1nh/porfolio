import { GitBranch, Mail } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { contactLinks } from "@/data/contact"
import { cn } from "@/lib/utils"

type SiteFooterProps = {
  /** Inside `#contact` snap — not a full page-section row. */
  embedded?: boolean
  className?: string
}

/**
 * Thin site footer — copyright + contact shortcuts.
 */
export async function SiteFooter({
  embedded = false,
  className,
}: SiteFooterProps) {
  const t = await getTranslations("footer")
  const tSite = await getTranslations("site")
  const year = new Date().getFullYear()

  const inner = (
    <div
      className={cn(
        "grid gap-3 md:grid-cols-10 md:items-center",
        embedded ? "gap-2" : "gap-4"
      )}
    >
      <p
        className={cn(
          "text-muted-foreground md:col-span-6",
          embedded ? "text-xs" : "text-sm"
        )}
      >
        <span className="font-heading font-semibold text-foreground">
          {tSite("name")}
        </span>
        {" · "}© {year}. {t("rights")}
      </p>

      <nav
        aria-label="Footer"
        className="grid auto-cols-max grid-flow-row gap-2 sm:grid-flow-col sm:gap-3 md:col-span-4 md:justify-end"
      >
        <a
          href={`mailto:${contactLinks.email}`}
          className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 text-sm font-medium break-all text-foreground transition-colors duration-200 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-0 sm:break-normal"
        >
          <Mail className="size-3.5 shrink-0" aria-hidden />
          {contactLinks.email}
        </a>
        <a
          href={contactLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground transition-colors duration-200 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-0"
        >
          <GitBranch className="size-3.5 shrink-0" aria-hidden />
          GitHub
        </a>
      </nav>

      <p className="text-xs text-muted-foreground md:col-span-10">
        {t("builtWith")}
      </p>
    </div>
  )

  if (embedded) {
    return (
      <footer
        className={cn(
          "col-span-10 border-t border-border pt-3 pb-1",
          className
        )}
      >
        {inner}
      </footer>
    )
  }

  return (
    <footer
      className={cn("page-section border-t border-border py-8", className)}
    >
      <div className="col-span-10">{inner}</div>
    </footer>
  )
}
