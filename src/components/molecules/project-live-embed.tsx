"use client"

import { ArrowUpRight, Globe } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EMBED_PROBE_MS = 3000

/** Hosts known to send X-Frame-Options: SAMEORIGIN — iframe cannot load cross-origin. */
const LIKELY_BLOCKED_HOSTS = new Set(["uctalent.io", "unchain-labs.com"])

type ProjectLiveEmbedProps = {
  url: string
  title: string
  openLabel: string
  fallbackHint: string
  className?: string
}

function isLikelyFrameBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    return LIKELY_BLOCKED_HOSTS.has(host)
  } catch {
    return true
  }
}

/**
 * Live site preview — iframe when allowed, flat fallback when the target blocks embedding.
 */
export function ProjectLiveEmbed({
  url,
  title,
  openLabel,
  fallbackHint,
  className,
}: ProjectLiveEmbedProps) {
  const [blocked, setBlocked] = useState(() => isLikelyFrameBlocked(url))
  const [probing, setProbing] = useState(!isLikelyFrameBlocked(url))

  useEffect(() => {
    const likelyBlocked = isLikelyFrameBlocked(url)
    setBlocked(likelyBlocked)
    setProbing(!likelyBlocked)

    if (likelyBlocked) return

    const timer = window.setTimeout(() => {
      setProbing(false)
    }, EMBED_PROBE_MS)

    return () => window.clearTimeout(timer)
  }, [url])

  const showFallback = blocked

  return (
    <article
      className={cn(
        "grid h-full min-h-[14rem] grid-rows-[auto_minmax(0,1fr)] border border-border bg-card",
        className
      )}
    >
      <header className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <span className="size-2 shrink-0 bg-primary" aria-hidden />
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
          {url.replace(/^https?:\/\//, "")}
        </p>
      </header>

      <div className="relative h-full min-h-0">
        {showFallback ? (
          <div className="grid h-full min-h-0 place-items-center gap-4 p-6 text-center">
            <span className="grid size-12 place-items-center border border-border bg-muted">
              <Globe className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {fallbackHint}
            </p>
            <Button
              size="sm"
              className="cursor-pointer rounded-none"
              nativeButton={false}
              render={
                <a href={url} target="_blank" rel="noopener noreferrer" />
              }
            >
              {openLabel}
              <ArrowUpRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <div className="relative h-full min-h-0">
            {probing ? (
              <div
                className="absolute inset-0 z-10 grid place-items-center bg-card/80 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                aria-live="polite"
              >
                Loading preview…
              </div>
            ) : null}
            <iframe
              src={url}
              title={title}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="size-full border-0 bg-background"
              onLoad={() => setProbing(false)}
              onError={() => {
                setBlocked(true)
                setProbing(false)
              }}
            />
          </div>
        )}
      </div>
    </article>
  )
}
