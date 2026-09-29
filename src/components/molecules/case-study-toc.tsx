"use client"

import { useEffect, useState } from "react"

import { prefersReducedMotion } from "@/lib/scroll-to-section"
import { cn } from "@/lib/utils"

type CaseStudyTocProps = {
  label: string
  chapters: readonly { id: string; label: string }[]
  className?: string
}

/** Sticky chapter index — the chapter crossing the upper third is marked active. */
export function CaseStudyToc({ label, chapters, className }: CaseStudyTocProps) {
  const [active, setActive] = useState(chapters[0]?.id ?? "")

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const probe = window.innerHeight * 0.35
      let current = chapters[0]?.id ?? ""
      for (const chapter of chapters) {
        const el = document.getElementById(chapter.id)
        if (el && el.getBoundingClientRect().top <= probe) current = chapter.id
      }
      setActive(current)
    }
    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", request, { passive: true })
    window.addEventListener("resize", request)
    return () => {
      window.removeEventListener("scroll", request)
      window.removeEventListener("resize", request)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [chapters])

  return (
    <nav aria-label={label} className={cn("grid content-start gap-4", className)}>
      <p className="system-label flex items-center gap-3 text-foreground">
        <span className="h-px w-6 bg-primary" aria-hidden />
        {label}
      </p>
      <ol className="grid border-l-2 border-border">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === active
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={isActive ? "location" : undefined}
                data-active={isActive}
                className="case-toc-link"
                onClick={(event) => {
                  const el = document.getElementById(chapter.id)
                  if (!el) return
                  event.preventDefault()
                  el.scrollIntoView({
                    behavior: prefersReducedMotion() ? "auto" : "smooth",
                    block: "start",
                  })
                  history.replaceState(null, "", `#${chapter.id}`)
                }}
              >
                <span className="font-mono text-[10px] font-bold tracking-[0.12em]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{chapter.label}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
