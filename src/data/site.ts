export const NAV_ITEMS = [
  { href: "#about", labelKey: "about" },
  { href: "#profile", labelKey: "profile" },
  { href: "#projects", labelKey: "projects" },
  { href: "#stack", labelKey: "stack" },
  { href: "#contact", labelKey: "contact" },
] as const

export type SiteRoutePath = "/" | "/cv"

export type SiteRoute = {
  path: SiteRoutePath
  changeFrequency: "weekly" | "monthly"
  priority: number
}

/** Indexable App Router paths — used by sitemap.xml. */
export const SITE_ROUTES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/cv", changeFrequency: "monthly", priority: 0.8 },
] as const satisfies readonly SiteRoute[]

export type NavItemKey = (typeof NAV_ITEMS)[number]["labelKey"]

/** Homepage section ids — order matches nav + section pager. */
export const HOME_SECTIONS = [
  "about",
  "profile",
  "projects",
  "stack",
  "contact",
] as const

export type HomeSectionId = (typeof HOME_SECTIONS)[number]

/**
 * One screen per section: at least a full viewport everywhere, and exactly one
 * snapped viewport on desktop (box-border so height includes padding).
 */
export const VIEWPORT_SECTION =
  "relative isolate min-h-svh overflow-x-clip lg:box-border lg:h-svh lg:min-h-0 lg:overflow-hidden"
