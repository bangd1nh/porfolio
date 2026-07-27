"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import {
  TERMINAL_PROMPT,
  terminalBootSteps,
} from "@/data/terminal-boot"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const CMD_TYPE_MS = 34
const EXEC_MS = 120
const BETWEEN_MS = 420
const LOOP_PAUSE_MS = 2_400
const FLICKER_MS = 450

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "out"; text: string }

type IdentityTerminalProps = {
  className?: string
}

function buildStaticLines(): Line[] {
  const lines: Line[] = []
  for (const step of terminalBootSteps) {
    if (step.cmd === "clear") continue
    lines.push({ kind: "cmd", text: step.cmd })
    for (const row of step.out) {
      lines.push({ kind: "out", text: row })
    }
  }
  return lines
}

/**
 * Decorative terminal under Profile Identity — loops a shell-like session.
 */
export function IdentityTerminal({ className }: IdentityTerminalProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const staticLines = useMemo(() => buildStaticLines(), [])
  const [lines, setLines] = useState<Line[]>([])
  const [typedCmd, setTypedCmd] = useState("")
  const [promptVisible, setPromptVisible] = useState(true)
  const [flicker, setFlicker] = useState(true)
  const [runId, setRunId] = useState(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const scrollerRef = useRef<HTMLDivElement>(null)

  const clearTimers = () => {
    for (const id of timersRef.current) clearTimeout(id)
    timersRef.current = []
  }

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  useEffect(() => {
    const pane = scrollerRef.current
    if (!pane) return
    pane.scrollTop = pane.scrollHeight
  }, [lines, typedCmd])

  useEffect(() => {
    if (reducedMotion) {
      setLines(staticLines)
      setTypedCmd("")
      setPromptVisible(true)
      setFlicker(false)
      return
    }

    clearTimers()
    setLines([])
    setTypedCmd("")
    setPromptVisible(true)
    setFlicker(true)

    let cancelled = false

    const run = () => {
      setFlicker(false)
      let stepIndex = 0
      let committed: Line[] = []

      const finishLoop = () => {
        setPromptVisible(true)
        setTypedCmd("")
        schedule(() => {
          if (cancelled) return
          setRunId((n) => n + 1)
        }, LOOP_PAUSE_MS)
      }

      const typeCommand = () => {
        if (cancelled) return
        const step = terminalBootSteps[stepIndex]
        if (!step) {
          finishLoop()
          return
        }

        setPromptVisible(true)
        setTypedCmd("")
        let i = 0

        const tick = () => {
          if (cancelled) return
          i += 1
          setTypedCmd(step.cmd.slice(0, i))
          if (i < step.cmd.length) {
            schedule(tick, CMD_TYPE_MS)
            return
          }

          schedule(() => {
            if (cancelled) return

            if (step.cmd === "clear") {
              committed = []
              setLines([])
              setTypedCmd("")
              stepIndex += 1
              schedule(typeCommand, BETWEEN_MS)
              return
            }

            committed = [
              ...committed,
              { kind: "cmd", text: step.cmd },
              ...step.out.map((text) => ({ kind: "out" as const, text })),
            ]
            setLines(committed)
            setTypedCmd("")
            stepIndex += 1

            if (stepIndex < terminalBootSteps.length) {
              schedule(typeCommand, BETWEEN_MS)
            } else {
              finishLoop()
            }
          }, EXEC_MS)
        }

        schedule(tick, CMD_TYPE_MS)
      }

      schedule(typeCommand, BETWEEN_MS * 0.5)
    }

    schedule(run, FLICKER_MS)

    return () => {
      cancelled = true
      clearTimers()
    }
  }, [reducedMotion, runId, staticLines])

  return (
    <div
      aria-hidden
      className={cn(
        "terminal-shell relative mt-1 hidden min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden border border-border bg-background font-mono text-xs text-foreground/90 transition-[border-color,box-shadow] duration-200 md:grid md:h-full md:min-h-0",
        "hover:border-primary/40 hover:shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_25%,transparent)]",
        flicker && "terminal-flicker",
        className
      )}
    >
      <div className="relative z-1 grid grid-cols-[auto_1fr] items-center gap-2 border-b border-border px-3 py-2">
        <span className="grid grid-flow-col gap-1.5">
          <span className="size-2 rounded-none bg-muted-foreground/50" />
          <span className="size-2 rounded-none bg-primary" />
          <span className="size-2 rounded-none bg-muted-foreground/35" />
        </span>
        <span className="truncate text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          terminal
        </span>
      </div>

      <div
        ref={scrollerRef}
        className="relative z-1 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain p-3 leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="grid gap-0.5">
          {lines.map((line, index) => (
            <p
              key={`${line.kind}-${index}-${line.text}`}
              className={cn(
                "whitespace-pre-wrap break-all",
                line.kind === "cmd" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {line.kind === "cmd" ? (
                <>
                  <span className="text-primary">{TERMINAL_PROMPT}</span>
                  {` ${line.text}`}
                </>
              ) : (
                line.text
              )}
            </p>
          ))}

          {promptVisible ? (
            <p className="whitespace-pre-wrap break-all">
              <span className="text-primary">{TERMINAL_PROMPT}</span>
              {typedCmd ? ` ${typedCmd}` : " "}
              <span className="terminal-caret" />
            </p>
          ) : null}
        </div>
      </div>

      <div className="terminal-scanlines absolute inset-0 z-2" />
      <div className="terminal-noise absolute inset-0 z-2" />
    </div>
  )
}
