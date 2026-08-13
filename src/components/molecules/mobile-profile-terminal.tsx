"use client"

import { useEffect, useState } from "react"

import { TERMINAL_PROMPT } from "@/data/terminal-boot"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const TYPE_MS = 28
const EXEC_MS = 220
const CLEAR_DELAY_MS = 2_000
const CLEAR_COMMAND = "clear"

export type MobileProfileTerminalStep = {
  command: string
  output: string
}

type MobileProfileTerminalProps = {
  steps: readonly MobileProfileTerminalStep[]
  className?: string
}

/**
 * Primary profile content for small screens — types through the actual profile
 * fields in a clear-and-replay loop, independent from the desktop decoration.
 */
export function MobileProfileTerminal({
  steps,
  className,
}: MobileProfileTerminalProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [stepIndex, setStepIndex] = useState(0)
  const [typedLength, setTypedLength] = useState(0)
  const [waitingToClear, setWaitingToClear] = useState(false)
  const currentStep = steps[stepIndex]
  const clearing = stepIndex >= steps.length
  const currentCommand = clearing ? CLEAR_COMMAND : currentStep?.command

  useEffect(() => {
    if (reducedMotion || !currentCommand) return

    if (clearing && waitingToClear) {
      const timer = window.setTimeout(
        () => setWaitingToClear(false),
        CLEAR_DELAY_MS
      )
      return () => window.clearTimeout(timer)
    }

    const isTyping = typedLength < currentCommand.length
    const timer = window.setTimeout(() => {
      if (isTyping) {
        setTypedLength((length) => length + 1)
        return
      }

      if (clearing) {
        setStepIndex(0)
        setTypedLength(0)
        return
      }

      const isLastStep = stepIndex === steps.length - 1
      setStepIndex((index) => index + 1)
      setTypedLength(0)
      if (isLastStep) setWaitingToClear(true)
    }, isTyping ? TYPE_MS : EXEC_MS)

    return () => window.clearTimeout(timer)
  }, [
    clearing,
    currentCommand,
    reducedMotion,
    stepIndex,
    steps.length,
    typedLength,
    waitingToClear,
  ])

  const completedSteps = reducedMotion ? steps : steps.slice(0, stepIndex)
  const activeCommand = reducedMotion ? "" : currentCommand?.slice(0, typedLength)

  return (
    <section
      className={cn(
        "grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden border border-border bg-card font-mono text-xs leading-relaxed text-foreground",
        className
      )}
      style={{ height: "22rem", minHeight: "22rem", maxHeight: "22rem" }}
      aria-label="Profile terminal"
    >
      <header className="grid grid-cols-[auto_1fr] items-center gap-2 border-b border-border px-3 py-2">
        <span className="grid grid-flow-col gap-1.5" aria-hidden>
          <span className="size-2 bg-muted-foreground/50" />
          <span className="size-2 bg-primary" />
          <span className="size-2 bg-muted-foreground/35" />
        </span>
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
          profile.sh
        </span>
      </header>

      <div className="grid content-start gap-2 overflow-hidden p-3 sm:p-4">
        {completedSteps.map((step) => (
          <div key={step.command} className="grid gap-0.5 break-words">
            <p>
              <span className="text-primary">{TERMINAL_PROMPT}</span>{" "}
              {step.command}
            </p>
            <p className="pl-2 text-muted-foreground">{step.output}</p>
          </div>
        ))}

        {!reducedMotion ? (
          <p className="break-all">
            <span className="text-primary">{TERMINAL_PROMPT}</span>{" "}
            {activeCommand}
            <span className="terminal-caret" />
          </p>
        ) : null}
      </div>
    </section>
  )
}
