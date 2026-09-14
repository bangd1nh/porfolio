"use client"

import { ChevronLeft } from "lucide-react"
import { useEffect, useId, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type ProjectRevealCardProps = {
  label: string
  badge?: string
  expandHint?: string
  children: ReactNode | ((expanded: boolean) => ReactNode)
  className?: string
}

/**
 * Mobile accordion card for project details / notes.
 */
export function ProjectRevealCard({
  label,
  badge,
  expandHint,
  children,
  className,
}: ProjectRevealCardProps) {
  const bodyId = useId()
  const [clickOpen, setClickOpen] = useState(false)

  useEffect(() => {
    setClickOpen(false)
  }, [label])

  useEffect(() => {
    if (!clickOpen) return

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setClickOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [clickOpen])

  const body =
    typeof children === "function" ? children(clickOpen) : children

  return (
    <section
      className={cn("grid min-h-0 w-full border border-border bg-card", className)}
      aria-label={label}
    >
      <button
        type="button"
        className={cn(
          "grid w-full shrink-0 cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-muted/30 px-2 py-2 text-left",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        )}
        aria-expanded={clickOpen}
        aria-controls={bodyId}
        onClick={() => setClickOpen((open) => !open)}
      >
        <span className="min-w-0 font-mono text-[10px] font-semibold tracking-[0.12em] text-foreground uppercase">
          {label}
        </span>
        {badge ? (
          <span className="shrink-0 border border-primary/60 bg-primary/10 dark:border-primary dark:bg-background px-1.5 py-0.5 font-mono text-[9px] font-semibold text-foreground uppercase">
            {badge}
          </span>
        ) : null}
        <ChevronLeft
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
            clickOpen ? "-rotate-90" : "rotate-90"
          )}
          aria-hidden
        />
      </button>

      <div
        id={bodyId}
        className={cn(
          "grid min-h-0 overflow-hidden transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
          clickOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className={cn("min-h-0", !clickOpen && "overflow-hidden")}>
          <div className="p-3 pt-0">{body}</div>
          {expandHint && clickOpen ? (
            <p className="border-t border-border px-3 pb-3 font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase">
              {expandHint}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
