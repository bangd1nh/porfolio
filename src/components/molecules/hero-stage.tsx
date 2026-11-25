"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ArrowDownRight } from "lucide-react"
import { useRef } from "react"

import { SkillIcon } from "@/components/atoms/skill-icon"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useMotionTier } from "@/hooks/use-motion-tier"
import { scrollToHashSection } from "@/lib/scroll-to-section"

gsap.registerPlugin(useGSAP)

type HeroStageProps = {
  children: React.ReactNode
  role: string
  location: string
  stack: readonly string[]
  badgeText: string
  badgeLabel: string
}

/** Max drift in px for a layer with depth 1. */
const DRIFT = 18

const STICKERS = [
  { name: "Next.js", className: "-top-5 right-6 rotate-6", depth: 1.3 },
  { name: "NestJS", className: "top-[38%] -left-12 -rotate-6", depth: 1.7 },
  { name: "PostgreSQL", className: "-bottom-4 right-10 rotate-3", depth: 1.1 },
] as const

/**
 * Layered hero composition — a code window behind the GitHub card, floating
 * tech stickers and a spinning availability badge, each drifting with the
 * pointer at its own depth.
 */
export function HeroStage({ children, role, location, stack, badgeText, badgeLabel }: HeroStageProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const finePointer = useMediaQuery("(pointer: fine)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const lite = useMotionTier() === "lite"

  useGSAP(
    () => {
      // Pointer parallax keeps several layers re-compositing on every move.
      if (!finePointer || reducedMotion || lite) return
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => ({
        depth: Number(el.dataset.depth) || 0,
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
      }))

      const onMove = (event: PointerEvent) => {
        const nx = event.clientX / window.innerWidth - 0.5
        const ny = event.clientY / window.innerHeight - 0.5
        for (const layer of layers) {
          layer.x(nx * layer.depth * DRIFT * 2)
          layer.y(ny * layer.depth * DRIFT * 2)
        }
      }

      window.addEventListener("pointermove", onMove, { passive: true })
      return () => window.removeEventListener("pointermove", onMove)
    },
    { scope: rootRef, dependencies: [finePointer, reducedMotion, lite], revertOnUpdate: true }
  )

  const stackLiteral = stack.map((item) => `"${item}"`)

  return (
    <div ref={rootRef} className="hero-stage relative">
      <div
        data-depth="-0.8"
        className="hero-code absolute -top-14 -left-28 z-0 hidden w-[26rem] lg:block xl:-left-64 short:-top-8"
        aria-hidden
      >
        <div className="border-3 border-border-brutal bg-card shadow-brutal">
          <div className="flex items-center gap-2 border-b-2 border-border-brutal px-3 py-2">
            <span className="size-2 bg-primary" />
            <span className="size-2 border border-foreground/40" />
            <span className="size-2 border border-foreground/40" />
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">bang.config.ts</span>
          </div>
          <pre className="overflow-hidden px-4 py-3 font-mono text-[11px] leading-[1.7] xl:text-xs">
            <code>
              <span className="code-line"><span className="code-key">const</span> bang = {"{"}</span>
              <span className="code-line">  role: <span className="code-str">&quot;{role}&quot;</span>,</span>
              <span className="code-line">  stack: [{stackLiteral.map((item, index) => (
                <span key={item}>
                  <span className="code-str">{item}</span>
                  {index < stackLiteral.length - 1 ? ", " : ""}
                </span>
              ))}],</span>
              <span className="code-line">  based: <span className="code-str">&quot;{location}&quot;</span>,</span>
              <span className="code-line">  shipping: <span className="code-key">true</span>,</span>
              <span className="code-line">{"}"}<span className="terminal-caret" /></span>
            </code>
          </pre>
        </div>
      </div>

      <div data-depth="0.35" className="relative z-10">
        {children}
      </div>

      {STICKERS.map((sticker) => (
        <span
          key={sticker.name}
          data-depth={sticker.depth}
          className={`absolute z-20 hidden lg:block ${sticker.className}`}
          aria-hidden
        >
          <span className="hero-sticker">
            <SkillIcon name={sticker.name} className="size-4" />
            {sticker.name}
          </span>
        </span>
      ))}

      <a
        href="#contact"
        data-depth="0.9"
        aria-label={badgeLabel}
        onClick={(event) => {
          event.preventDefault()
          scrollToHashSection("#contact", !reducedMotion)
        }}
        className="hero-badge absolute -bottom-14 -left-[6.5rem] z-30 hidden lg:grid short:-bottom-10"
      >
        <svg viewBox="0 0 120 120" className="hero-badge-ring" aria-hidden>
          <defs>
            <path id="hero-badge-path" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
          </defs>
          <text>
            <textPath href="#hero-badge-path" textLength="289" lengthAdjust="spacingAndGlyphs">
              {badgeText}
            </textPath>
          </text>
        </svg>
        <span className="hero-badge-core" aria-hidden>
          <ArrowDownRight className="size-5" />
        </span>
      </a>
    </div>
  )
}
