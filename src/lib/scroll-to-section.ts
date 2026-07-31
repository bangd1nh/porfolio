/** Dispatched before programmatic scroll so SectionPager can suppress wheel hijacking. */
export const SECTION_PAGER_LOCK_EVENT = "section-pager-lock"

/** Match typical smooth-scroll duration — pager ignores wheel until scroll finishes. */
export const SECTION_SCROLL_LOCK_MS = 900

let scrollingToId: string | null = null
let scrollClearTimer: ReturnType<typeof setTimeout> | null = null
let lastScrollId: string | null = null
let lastScrollAt = 0

export function lockSectionPager() {
  window.dispatchEvent(new CustomEvent(SECTION_PAGER_LOCK_EVENT))
}

function getScrollTopForElement(el: HTMLElement): number {
  const pad =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  return el.getBoundingClientRect().top + window.scrollY - pad
}

function clearScrollingTarget(id: string) {
  if (scrollingToId === id) scrollingToId = null
}

/** Scroll to an in-page hash target and sync the URL without navigation. */
export function scrollToHashSection(hash: string, smooth = true): boolean {
  const id = hash.replace(/^#/, "")
  if (!id) return false

  const el = document.getElementById(id)
  if (!el) return false

  const now = Date.now()
  if (lastScrollId === id && now - lastScrollAt < 80) return true
  lastScrollId = id
  lastScrollAt = now

  if (scrollingToId !== null && scrollingToId !== id) {
    window.scrollTo({ top: window.scrollY, behavior: "instant" })
  }

  scrollingToId = id
  if (scrollClearTimer) clearTimeout(scrollClearTimer)

  const top = getScrollTopForElement(el)
  window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" })
  history.replaceState(null, "", `#${id}`)
  lockSectionPager()

  const finish = () => clearScrollingTarget(id)

  if (smooth && "onscrollend" in window) {
    window.addEventListener("scrollend", finish, { once: true })
  }

  scrollClearTimer = setTimeout(finish, smooth ? SECTION_SCROLL_LOCK_MS : 0)

  return true
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}
