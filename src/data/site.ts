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
 * One full viewport per section on desktop: height 100svh + top padding clears
 * the fixed navbar (box-border so bottom aligns with the screen edge).
 * Pair with `lg:pt-0` on homepage PageGrid to avoid double clearance.
 * Do not combine with `lg:py-*` / `sm:py-*` — those override `lg:pt-*`.
 * Phone/tablet: content-sized sections + native scroll.
 */
export const VIEWPORT_UNDER_HEADER =
  "lg:box-border lg:h-svh lg:!pt-[var(--site-header-clearance)]"
