"use client"

import { ArrowUpRight, Globe } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EMBED_PROBE_MS = 3000
/** Render all live previews at a consistent desktop width, then fit the frame. */
const PREVIEW_VIEWPORT_WIDTH = 1280

/** Hosts with X-Frame-Options: SAMEORIGIN and no CSP frame-ancestors override. */
const FRAME_BLOCKED_HOSTS = new Set(["uctalent.io"])

type PreviewMode = "iframe" | "shot" | "empty"

type ProjectLiveEmbedProps = {
  url: string
  title: string
  openLabel: string
  fallbackHint: string
  className?: string
}

function hostFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

function isFrameBlocked(url: string): boolean {
  const host = hostFromUrl(url)
  return host === null || FRAME_BLOCKED_HOSTS.has(host)
}

function screenshotSrc(url: string): string {
  return `https://image.thum.io/get/width/1440/crop/1400/noanimate/${url}`
}

/**
 * Live site preview — iframe when the target allows embedding, screenshot otherwise.
 */
export function ProjectLiveEmbed({
  url,
  title,
  openLabel,
  fallbackHint,
  className,
}: ProjectLiveEmbedProps) {
  const [mode, setMode] = useState<PreviewMode>(() =>
    isFrameBlocked(url) ? "shot" : "iframe"
  )
  const [probing, setProbing] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 })
  const previewScale = previewSize.width / PREVIEW_VIEWPORT_WIDTH

  useEffect(() => {
    const preview = previewRef.current
    if (!preview) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setPreviewSize({ width, height })
    })

    observer.observe(preview)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const nextMode: PreviewMode = isFrameBlocked(url) ? "shot" : "iframe"
    const resetTimer = window.setTimeout(() => {
      setMode(nextMode)
      setProbing(true)
    }, 0)

    if (nextMode !== "iframe") {
      return () => window.clearTimeout(resetTimer)
    }

    const timer = window.setTimeout(() => {
      setProbing(false)
    }, EMBED_PROBE_MS)

    return () => {
      window.clearTimeout(resetTimer)
      window.clearTimeout(timer)
    }
  }, [url])

  return (
    <article
      className={cn(
        "grid h-full min-h-[14rem] grid-rows-[auto_minmax(0,1fr)] border border-border bg-card",
        className
      )}
    >
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <span className="size-2 shrink-0 bg-primary" aria-hidden />
        <p className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
          {url.replace(/^https?:\/\//, "")}
        </p>
      </header>

      <div ref={previewRef} className="relative h-full min-h-0 overflow-hidden">
        {probing ? (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-card text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            aria-live="polite"
          >
            Loading preview…
          </div>
        ) : null}

        {mode === "iframe" && previewSize.width > 0 ? (
          <iframe
            src={url}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="pointer-events-none absolute top-0 left-0 border-0 bg-background"
            style={{
              width: PREVIEW_VIEWPORT_WIDTH,
              height: previewSize.height / previewScale,
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
            }}
            onLoad={() => setProbing(false)}
            onError={() => {
              setMode("shot")
              setProbing(true)
            }}
          />
        ) : null}

        {mode === "shot" ? (
          <Image
            src={screenshotSrc(url)}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover object-top"
            onLoad={() => setProbing(false)}
            onError={() => {
              setMode("empty")
              setProbing(false)
            }}
          />
        ) : null}

        {mode === "empty" ? (
          <div className="grid h-full min-h-0 place-items-center gap-4 p-6 text-center">
            <span className="grid size-12 place-items-center border border-border bg-muted">
              <Globe className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {fallbackHint}
            </p>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-20 grid items-end justify-items-end p-3">
          <Button
            size="sm"
            className="pointer-events-auto cursor-pointer rounded-none"
            nativeButton={false}
            render={<a href={url} target="_blank" rel="noopener noreferrer" />}
          >
            {openLabel}
            <ArrowUpRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  )
}
