import { SplitWords } from "@/components/atoms/split-words"
import { HOME_SECTIONS } from "@/data/site"
import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  /** 1-based screen number. */
  index: number
  label: string
  title: string
  description?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

const pad = (value: number) => String(value).padStart(2, "0")

/** Shared screen header — index rule, masked title, supporting copy. */
export function SectionHeading({
  index,
  label,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <header className={cn("col-span-10 grid h-fit min-w-0 gap-y-3 self-start", className)}>
      <div data-reveal="up" className="flex items-center gap-3">
        <span className="font-mono text-[11px] font-bold text-primary">{pad(index)}</span>
        <span data-reveal="draw" className="h-px w-10 bg-foreground/50" aria-hidden />
        <p className="system-label text-foreground">{label}</p>
        <span className="ml-auto hidden font-mono text-[10px] tracking-[0.14em] text-muted-foreground sm:inline">
          {pad(index)} / {pad(HOME_SECTIONS.length)}
        </span>
      </div>
      <div className="grid gap-2">
        <h2 data-reveal="title" className={cn("section-title", titleClassName)}>
          <SplitWords text={title} />
        </h2>
        {description ? (
          <p
            data-reveal="up"
            data-reveal-delay="0.1"
            className={cn("section-description", descriptionClassName)}
          >
            {description}
          </p>
        ) : null}
      </div>
    </header>
  )
}

/** Oversized outline numeral that drifts behind a screen. */
export function SectionWatermark({ index, className }: { index: number; className?: string }) {
  return (
    <span aria-hidden className={cn("section-watermark", className)}>
      <span data-parallax="0.18" className="block">
        {pad(index)}
      </span>
    </span>
  )
}
