"use client"

import { usePathname, Link } from "@/i18n/navigation"
import { useGlobalLoader } from "@/components/providers/global-loader"

type TransitionLinkProps = React.ComponentProps<typeof Link>

function getTargetPathname(href: string, currentPathname: string) {
  if (href.startsWith("#") || href.startsWith("?")) return currentPathname

  const [targetPathname] = href.split(/[?#]/, 1)
  return targetPathname || currentPathname
}

/** Starts the branded boot sequence before navigating between full app routes. */
export function TransitionLink({ onClick, href, ...props }: TransitionLinkProps) {
  const pathname = usePathname()
  const { startLoader } = useGlobalLoader()

  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event)

        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          typeof href !== "string" ||
          getTargetPathname(href, pathname) === pathname
        ) {
          return
        }

        startLoader()
      }}
    />
  )
}
