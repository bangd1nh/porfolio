import { cn } from "@/lib/utils"

type MarqueeProps = {
  children: React.ReactNode
  className?: string
  /** Seconds for one full loop. */
  duration?: number
  reverse?: boolean
}

/** Infinite horizontal ticker — content is duplicated once for a seamless loop. */
export function Marquee({ children, className, duration = 40, reverse }: MarqueeProps) {
  return (
    <div
      className={cn("marquee", reverse && "marquee-reverse", className)}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
