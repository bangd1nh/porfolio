export const NAV_ITEMS = [
  { href: "#about", labelKey: "about" },
  { href: "#profile", labelKey: "profile" },
  { href: "#projects", labelKey: "projects" },
  { href: "#stack", labelKey: "stack" },
  { href: "#contact", labelKey: "contact" },
] as const

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
 * One full viewport per section on desktop (box-border so height includes padding).
 * Phone/tablet: content-sized sections + native scroll.
 */
export const VIEWPORT_SECTION =
  "lg:box-border lg:h-svh lg:overflow-hidden"
