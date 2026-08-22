"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { SkillIcon } from "@/components/atoms/skill-icon"
import { cn } from "@/lib/utils"

type SkillGroup = {
  id: string
  title: string
  items: readonly string[]
}

type SkillStackExplorerProps = {
  dailyDrivers: readonly string[]
  aiSystems: readonly string[]
  groups: readonly SkillGroup[]
  labels: {
    dailyDrivers: string
    aiSystems: string
    dailyStatus: string
    aiStatus: string
    viewFull: string
    hideFull: string
  }
}

function FeaturedSkillColumn({
  index,
  title,
  status,
  items,
  className,
}: {
  index: string
  title: string
  status: string
  items: readonly string[]
  className?: string
}) {
  return (
    <article className={cn("grid content-start gap-5", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1.5">
          <p className="system-label">{index} / {title}</p>
          <p className="font-mono text-[10px] tracking-[0.1em] text-primary uppercase">
            {status}
          </p>
        </div>
      </header>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item} className="flex min-w-0 items-center gap-2 text-sm font-semibold sm:text-base">
            <SkillIcon name={item} className="size-4 shrink-0 text-muted-foreground" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export function SkillStackExplorer({
  dailyDrivers,
  aiSystems,
  groups,
  labels,
}: SkillStackExplorerProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="grid gap-7">
      <div className="grid gap-7 border-y border-border py-6 lg:grid-cols-2 lg:gap-0 lg:py-8">
        <FeaturedSkillColumn
          index="01"
          title={labels.dailyDrivers}
          status={labels.dailyStatus}
          items={dailyDrivers}
          className="lg:pr-8"
        />
        <FeaturedSkillColumn
          index="02"
          title={labels.aiSystems}
          status={labels.aiStatus}
          items={aiSystems}
          className="border-t border-border pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        />
      </div>

      <div className="grid gap-5">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="full-stack-inventory"
          onClick={() => setExpanded((value) => !value)}
          className="system-link group flex w-fit cursor-pointer items-center gap-2 text-left"
        >
          {expanded ? labels.hideFull : labels.viewFull}
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300 motion-reduce:transition-none",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        {expanded ? (
          <div
            id="full-stack-inventory"
            className="grid animate-in gap-0 border-t border-border fade-in slide-in-from-top-2 duration-300 motion-reduce:animate-none"
          >
            {groups.map((group, index) => (
              <article
                key={group.id}
                className="grid gap-3 border-b border-border py-4 sm:grid-cols-[minmax(10rem,0.7fr)_2fr] sm:gap-6"
              >
                <h3 className="system-label pt-1">
                  {String(index + 3).padStart(2, "0")} / {group.title}
                </h3>
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      <SkillIcon name={item} className="size-3.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
