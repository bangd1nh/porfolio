"use client"

import { useEffect, useRef, useState } from "react"

import { useGlobalLoader } from "@/components/providers/global-loader"
import { useMediaQuery } from "@/hooks/use-media-query"

const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFXYZ"
const FRAME_MS = 32
const FRAMES = 22

type ScrambleTextProps = {
  text: string
  className?: string
}

/** Text that decodes from random glyphs after the intro, and again on hover. */
export function ScrambleText({ text, className }: ScrambleTextProps) {
  const { introReady } = useGlobalLoader()
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  // null → show the real text; a string → mid-scramble frame.
  const [scrambled, setScrambled] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const run = () => {
    if (reducedMotion) return
    if (timer.current) window.clearInterval(timer.current)
    let frame = 0
    timer.current = window.setInterval(() => {
      frame += 1
      const revealed = Math.floor((frame / FRAMES) * text.length)
      setScrambled(
        Array.from(text)
          .map((char, index) => {
            if (char === " " || index < revealed) return char
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join("")
      )
      if (frame >= FRAMES && timer.current) {
        window.clearInterval(timer.current)
        timer.current = null
        setScrambled(null)
      }
    }, FRAME_MS)
  }

  useEffect(() => {
    if (!introReady || reducedMotion) return
    const delay = window.setTimeout(run, 350)
    return () => window.clearTimeout(delay)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per intro
  }, [introReady, reducedMotion, text])

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current)
    },
    []
  )

  return (
    <span className={className} onPointerEnter={run}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{scrambled ?? text}</span>
    </span>
  )
}
