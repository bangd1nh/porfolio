"use client"

import { ArrowUpRight, Globe } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EMBED_TIMEOUT_MS = 8000
/** Render all live previews at a consistent desktop width, then fit the frame. */
const PREVIEW_VIEWPORT_WIDTH = 1280
/** Crop the iframe’s native scrollbar; overflow-hidden cannot hide a nested document’s bar. */
const PREVIEW_SCROLLBAR_CROP = 24

/** Hosts with X-Frame-Options: SAMEORIGIN and no CSP frame-ancestors override. */
const FRAME_BLOCKED_HOSTS = new Set(["uctalent.io"])

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
  const frameBlocked = isFrameBlocked(url)
  const [nearViewport, setNearViewport] = useState(false)
  const [frameReady, setFrameReady] = useState(false)
  const [frameFailed, setFrameFailed] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 })
  const previewScale =
    previewSize.width / (PREVIEW_VIEWPORT_WIDTH - PREVIEW_SCROLLBAR_CROP)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (!("IntersectionObserver" in window)) {
      setNearViewport(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: "320px 0px", threshold: 0.01 }
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [])

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
    if (!nearViewport || frameBlocked || frameReady) return
    const timer = window.setTimeout(() => setFrameFailed(true), EMBED_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [frameBlocked, frameReady, nearViewport])

  const shouldLoadFrame =
    nearViewport && !frameBlocked && !frameFailed && previewSize.width > 0
  const showFallback = posterFailed && !frameReady

  return (
    <article
      ref={rootRef}
      aria-busy={shouldLoadFrame && !frameReady}
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
        {!posterFailed ? (
          <Image
            src={screenshotSrc(url)}
            alt=""
            fill
            unoptimized
            loading="eager"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className={cn(
              "object-cover object-top transition-opacity duration-200 motion-reduce:transition-none",
              frameReady ? "opacity-0" : "opacity-100"
            )}
            onError={() => setPosterFailed(true)}
          />
        ) : null}

        {showFallback ? (
          <div className="grid h-full min-h-0 place-items-center gap-4 p-6 text-center">
            <span className="grid size-12 place-items-center border border-border bg-muted">
              <Globe className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {fallbackHint}
            </p>
          </div>
        ) : null}

        {shouldLoadFrame ? (
          <iframe
            src={url}
            title={title}
            loading="lazy"
            scrolling="no"
            tabIndex={-1}
            referrerPolicy="strict-origin-when-cross-origin"
            className={cn(
              "pointer-events-none absolute top-0 left-0 overflow-hidden border-0 bg-background transition-opacity duration-200 motion-reduce:transition-none",
              frameReady ? "opacity-100" : "opacity-0"
            )}
            style={{
              width: PREVIEW_VIEWPORT_WIDTH,
              height: previewSize.height / previewScale,
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
            }}
            onLoad={() => setFrameReady(true)}
            onError={() => setFrameFailed(true)}
          />
        ) : null}

        {shouldLoadFrame && !frameReady ? (
          <div
            className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 border border-border bg-card/90 px-2 py-1"
            aria-hidden
          >
            <span className="size-1.5 animate-pulse bg-primary motion-reduce:animate-none" />
            <span className="h-1.5 w-10 bg-muted-foreground/25" />
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-20 grid items-end justify-items-end p-3">
          <Button
            size="sm"
            className="pointer-events-auto min-h-11 cursor-pointer rounded-none lg:min-h-9"
            nativeButton={false}
            render={<a href={url} target="_blank" rel="noopener noreferrer" />}
          >
            {openLabel}
            <ArrowUpRight data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  )
}
