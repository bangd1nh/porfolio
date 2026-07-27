"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type TypewriterTextProps = {
  phrases: readonly string[]
  className?: string
  /** ms per character while typing */
  typingMs?: number
  /** ms per character while deleting */
  deletingMs?: number
  /** pause after a phrase is fully typed */
  holdMs?: number
}

/**
 * Cycles phrases with a typewriter effect (type → hold → delete → next).
 */
export function TypewriterText({
  phrases,
  className,
  typingMs = 36,
  deletingMs = 22,
  holdMs = 1800,
}: TypewriterTextProps) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (phrases.length === 0) return

    if (reducedMotion) {
      setText(phrases[phraseIndex] ?? "")
      const timer = window.setTimeout(() => {
        setPhraseIndex((index) => (index + 1) % phrases.length)
      }, holdMs)
      return () => window.clearTimeout(timer)
    }

    const current = phrases[phraseIndex] ?? ""

    if (!isDeleting && text === current) {
      const timer = window.setTimeout(() => setIsDeleting(true), holdMs)
      return () => window.clearTimeout(timer)
    }

    if (isDeleting && text === "") {
      setIsDeleting(false)
      setPhraseIndex((index) => (index + 1) % phrases.length)
      return
    }

    const timer = window.setTimeout(
      () => {
        const nextLength = text.length + (isDeleting ? -1 : 1)
        setText(current.slice(0, nextLength))
      },
      isDeleting ? deletingMs : typingMs
    )

    return () => window.clearTimeout(timer)
  }, [
    deletingMs,
    holdMs,
    isDeleting,
    phraseIndex,
    phrases,
    reducedMotion,
    text,
    typingMs,
  ])

  return (
    <p
      className={cn(
        "min-h-[2.75em] text-base leading-relaxed text-muted-foreground md:min-h-[3em] md:text-lg",
        className
      )}
      aria-live="polite"
    >
      <span className="whitespace-pre-line">{text}</span>
      <span
        className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-pulse bg-primary align-baseline"
        aria-hidden
      />
    </p>
  )
}
