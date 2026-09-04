"use client"

import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import type { ProjectPreviewType } from "@/data/projects"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const IFRAME_LOAD_TIMEOUT_MS = 4500
const DESKTOP_VIEWPORT_WIDTH = 1280
const SCROLLBAR_CROP = 24
const DESKTOP_VIEWPORT_HEIGHT = Math.round(
  (DESKTOP_VIEWPORT_WIDTH - SCROLLBAR_CROP) * (10 / 16)
)

export type WebsitePreviewProps = {
  url: string
  title: string
  fallbackImage: string
  previewType: ProjectPreviewType
  /** Resolved server-side from headers when previewType is `auto`. */
  embedAllowed: boolean
  openLabel?: string | undefined
  className?: string
}

function isRemoteSrc(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://")
}

/**
 * Live or static website preview inside the portfolio browser frame.
 * Screenshot is always the base layer; iframe mounts only when embed is allowed.
 */
export function WebsitePreview({
  url,
  title,
  fallbackImage,
  previewType,
  embedAllowed,
  openLabel,
  className,
}: WebsitePreviewProps) {
  const isCoarsePointer = useMediaQuery("(max-width: 1023px)")
  const canTryIframe =
    embedAllowed && previewType !== "image" && !isCoarsePointer

  const [nearViewport, setNearViewport] = useState(false)
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 })
  const [imageReady, setImageReady] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const [iframeAbandoned, setIframeAbandoned] = useState(false)

  const rootRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const viewportWidth = DESKTOP_VIEWPORT_WIDTH - SCROLLBAR_CROP
  const scaleW = previewSize.width > 0 ? previewSize.width / viewportWidth : 1
  const scaleH =
    previewSize.height > 0 ? previewSize.height / DESKTOP_VIEWPORT_HEIGHT : 1
  const previewScale = Math.min(scaleW, scaleH, 1)
  const scaledWidth = viewportWidth * previewScale
  const previewOffsetX = Math.max(0, (previewSize.width - scaledWidth) / 2)

  const shouldMountIframe =
    canTryIframe &&
    nearViewport &&
    !iframeAbandoned &&
    previewSize.width > 0 &&
    previewSize.height > 0

  const showIframe = shouldMountIframe && iframeReady
  const showImageLayer = !showIframe
  const showIframeLoading =
    shouldMountIframe && !iframeReady && !iframeAbandoned

  useEffect(() => {
    setImageReady(false)
    setIframeReady(false)
    setIframeAbandoned(false)
  }, [url, fallbackImage, previewType, embedAllowed])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setNearViewport(true))
      return () => cancelAnimationFrame(frame)
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
    if (!shouldMountIframe || iframeReady) return
    const timer = window.setTimeout(
      () => setIframeAbandoned(true),
      IFRAME_LOAD_TIMEOUT_MS
    )
    return () => window.clearTimeout(timer)
  }, [iframeReady, shouldMountIframe])

  return (
    <article
      ref={rootRef}
      aria-busy={showIframeLoading}
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

      <div
        ref={previewRef}
        className="group/preview relative h-full min-h-0 overflow-hidden bg-muted/30"
      >
        {nearViewport ? (
          <Image
            src={fallbackImage}
            alt={title}
            fill
            unoptimized={isRemoteSrc(fallbackImage)}
            loading="lazy"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className={cn(
              "object-cover object-top transition-opacity duration-300 motion-reduce:transition-none",
              showImageLayer && imageReady ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageReady(true)}
          />
        ) : null}

        {shouldMountIframe ? (
          <iframe
            src={url}
            title={title}
            loading="lazy"
            tabIndex={-1}
            referrerPolicy="strict-origin-when-cross-origin"
            className={cn(
              "pointer-events-none absolute top-0 overflow-hidden border-0 bg-transparent transition-opacity duration-300 motion-reduce:transition-none",
              showIframe ? "opacity-100" : "opacity-0"
            )}
            style={{
              width: viewportWidth,
              height: DESKTOP_VIEWPORT_HEIGHT,
              left: previewOffsetX,
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
            }}
            onLoad={() => setIframeReady(true)}
          />
        ) : null}

        {showIframeLoading ? (
          <div
            className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-muted/15"
            aria-hidden
          >
            <div className="flex items-center gap-2 border border-border bg-card/90 px-3 py-2">
              <span className="size-1.5 animate-pulse bg-primary motion-reduce:animate-none" />
              <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                Loading
              </span>
            </div>
          </div>
        ) : null}

        {/* Blocks iframe/image interaction — only the LIVE SITE CTA opens the project URL. */}
        <div
          className="absolute inset-0 z-20 cursor-default"
          aria-hidden
          onClick={(event) => event.preventDefault()}
        />

        {openLabel ? (
          <div className="pointer-events-none absolute inset-0 z-30 grid items-end justify-items-end p-3">
            <Button
              size="sm"
              className="pointer-events-auto min-h-11 cursor-pointer rounded-none lg:min-h-9"
              nativeButton={false}
              render={
                <a href={url} target="_blank" rel="noopener noreferrer" />
              }
            >
              {openLabel}
              <ArrowUpRight data-icon="inline-end" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}
