"use client"

import { useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type RailDrawerSlotProps = {
  label: string
  badge?: string
  open: boolean
  onOpen: () => void
  onClose: () => void
  children: ReactNode
}

function RailStackedLabel({ label }: { label: string }) {
  const words = label.split(/\s+/).filter(Boolean)

  return (
    <span className="flex flex-col items-center gap-2 leading-none">
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className="flex flex-col items-center gap-px"
        >
          {word.split("").map((char, charIndex) => (
            <span
              key={`${wordIndex}-${charIndex}`}
              className="font-mono text-[9px] font-semibold tracking-[0.04em] text-foreground uppercase"
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

function RailDrawerSlot({
  label,
  badge,
  open,
  onOpen,
  onClose,
  children,
}: RailDrawerSlotProps) {
  return (
    <div
      className="relative h-full min-h-0 overflow-visible"
      onPointerEnter={onOpen}
      onPointerLeave={onClose}
    >
      <div
        className={cn(
          "absolute inset-y-0 right-0 grid h-full overflow-hidden border border-border bg-card",
          "grid-cols-[var(--project-rail-width,3.25rem)_minmax(0,1fr)]",
          "origin-right transition-[width] duration-200 motion-reduce:transition-none",
          open
            ? "z-30 w-[var(--project-drawer-width,28rem)]"
            : "z-0 w-[var(--project-rail-width,3.25rem)]"
        )}
        aria-label={label}
      >
        <div className="flex h-full w-[var(--project-rail-width,3.25rem)] shrink-0 flex-col items-center justify-center gap-2 border-r border-border bg-muted/30 px-1 py-3">
          <RailStackedLabel label={label} />
          {badge ? (
            <span className="border border-primary/60 bg-primary/10 px-1 py-0.5 font-mono text-[8px] font-semibold text-foreground uppercase">
              {badge}
            </span>
          ) : null}
        </div>

        <div
          className="h-full min-h-0 min-w-0 overflow-hidden"
          aria-hidden={!open}
        >
          <div className="h-full w-full min-h-0 overflow-hidden p-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export type ProjectPreviewRailProps = {
  detailsLabel: string
  notesLabel: string
  notesBadge?: string
  details: ReactNode
  notes: ReactNode
  className?: string
}

/**
 * Desktop preview rail — two half-height drawers; only one expands at a time.
 */
export function ProjectPreviewRail({
  detailsLabel,
  notesLabel,
  notesBadge,
  details,
  notes,
  className,
}: ProjectPreviewRailProps) {
  const [openSlot, setOpenSlot] = useState<"details" | "notes" | null>(null)

  return (
    <div
      className={cn(
        "pointer-events-auto grid h-full grid-rows-2 gap-2",
        className
      )}
    >
      <RailDrawerSlot
        label={detailsLabel}
        open={openSlot === "details"}
        onOpen={() => setOpenSlot("details")}
        onClose={() => setOpenSlot((slot) => (slot === "details" ? null : slot))}
      >
        {details}
      </RailDrawerSlot>

      <RailDrawerSlot
        label={notesLabel}
        badge={notesBadge}
        open={openSlot === "notes"}
        onOpen={() => setOpenSlot("notes")}
        onClose={() => setOpenSlot((slot) => (slot === "notes" ? null : slot))}
      >
        {notes}
      </RailDrawerSlot>
    </div>
  )
}
