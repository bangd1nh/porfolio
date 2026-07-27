import type { LucideIcon } from "lucide-react"
import {
  Bot,
  Boxes,
  Calendar,
  Code2,
  Database,
  GraduationCap,
  KeyRound,
  Layers,
  MapPin,
  Share2,
  UserRound,
} from "lucide-react"

import { SkillIcon } from "@/components/atoms/skill-icon"
import { cn } from "@/lib/utils"

type ProfileMetaItemProps = {
  icon: LucideIcon
  label: string
  value: string
  className?: string
}

export function ProfileMetaItem({
  icon: Icon,
  label,
  value,
  className,
}: ProfileMetaItemProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr] items-start gap-3 border border-border bg-card p-4",
        className
      )}
    >
      <span className="grid size-9 place-items-center border border-border bg-muted text-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="grid gap-0.5">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground md:text-base">{value}</p>
      </div>
    </div>
  )
}

type ProfileSkillGroupCardProps = {
  title: string
  items: readonly string[]
  icon: LucideIcon
  className?: string
  /** Denser padding/pills — one-screen stack section. */
  compact?: boolean
}

export function ProfileSkillGroupCard({
  title,
  items,
  icon: Icon,
  className,
  compact = false,
}: ProfileSkillGroupCardProps) {
  return (
    <article
      className={cn(
        "grid w-full max-w-full border border-border bg-card",
        compact ? "gap-3 p-4 md:p-5" : "gap-3 p-4",
        className
      )}
    >
      <header className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-foreground" aria-hidden />
        <h3
          className={cn(
            "font-heading font-semibold tracking-tight text-foreground",
            compact ? "text-sm md:text-base" : "text-base"
          )}
        >
          {title}
        </h3>
      </header>
      <ul className="flex max-w-full flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-1.5 border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground transition-[background-color,border-color] duration-200 ease-out hover:border-foreground/30 hover:bg-card focus-within:border-foreground/30"
          >
            <SkillIcon name={item} className="text-foreground" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export const profileMetaIcons = {
  name: UserRound,
  birth: Calendar,
  location: MapPin,
  role: Code2,
  education: GraduationCap,
} as const

export const profileSkillIcons = {
  languages: Code2,
  databases: Database,
  frameworks: Layers,
  api: Share2,
  security: KeyRound,
  other: Boxes,
  ai: Bot,
} as const
