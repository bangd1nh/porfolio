import { ArrowRight } from "lucide-react"
import Image from "next/image"

import { TransitionLink } from "@/components/molecules/transition-link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ProjectCardVariant = "featured" | "compact" | "wide"

export type ProjectCardProps = {
  id: string
  /** 1-based position in the grid. */
  index: number
  icon: string
  title: string
  period: string
  outcome: string
  viewDetailsLabel: string
  variant?: ProjectCardVariant
  featuredBadgeLabel?: string
  className?: string
}

function ProjectCardCta({
  id,
  viewDetailsLabel,
  className,
}: {
  id: string
  viewDetailsLabel: string
  className?: string
}) {
  return (
    <Button
      variant="outline"
      size="default"
      className={cn(
        "min-h-11 w-full cursor-pointer rounded-none border-3 px-4 text-sm",
        className
      )}
      nativeButton={false}
      render={<TransitionLink href={`/projects/${id}`} prefetch={false} />}
    >
      {viewDetailsLabel}
      <ArrowRight
        data-icon="inline-end"
        className="transition-transform duration-300 group-hover/card:translate-x-1 motion-reduce:transition-none"
        aria-hidden
      />
    </Button>
  )
}

/** Homepage project tile — bento variants. */
export function ProjectCard({
  id,
  index,
  icon,
  title,
  period,
  outcome,
  viewDetailsLabel,
  variant = "compact",
  featuredBadgeLabel,
  className,
}: ProjectCardProps) {
  if (variant === "wide") {
    return (
      <article
        id={`project-${id}`}
        data-spotlight
        className={cn(
          "project-card group/card grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] border-3 border-border-brutal bg-card shadow-brutal-sm sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-rows-1 sm:items-center sm:gap-x-5 sm:p-5",
          className
        )}
      >
        <div className="project-card-media grid place-items-center self-stretch border-b border-border px-4 py-5 sm:-my-5 sm:-ml-5 sm:border-b-0 sm:border-r sm:px-8">
          <span className="project-card-index" aria-hidden>
            {String(index).padStart(2, "0")}
          </span>
          <Image
            src={icon}
            alt={`${title} logo`}
            width={280}
            height={160}
            unoptimized
            className="h-auto max-h-14 w-auto max-w-[8rem] object-contain sm:max-h-16 sm:max-w-[9rem]"
          />
        </div>

        <div className="grid min-w-0 gap-1.5 p-4 sm:p-0">
          <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {period}
          </p>
          <h3 className="font-heading text-lg font-semibold tracking-tight break-words sm:text-xl">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-foreground sm:text-base">
            {outcome}
          </p>
        </div>

        <footer className="border-t border-border p-4 sm:border-t-0 sm:p-0 sm:pl-2">
          <ProjectCardCta
            id={id}
            viewDetailsLabel={viewDetailsLabel}
            className="sm:w-auto sm:min-w-[10.5rem]"
          />
        </footer>
      </article>
    )
  }

  if (variant === "featured") {
    return (
      <article
        id={`project-${id}`}
        data-spotlight
        className={cn(
          "project-card group/card grid h-full min-h-0 grid-rows-[auto_auto_auto] border-3 border-primary lg:grid-rows-[minmax(0,1fr)_auto_auto] [--card-shadow:var(--foreground)] bg-card shadow-[5px_5px_0_0_var(--foreground)]",
          className
        )}
      >
        <div className="project-card-media grid min-h-0 place-items-center overflow-hidden border-b border-border px-6 py-10 sm:py-12 lg:py-6">
          <span className="project-card-index" aria-hidden>
            {String(index).padStart(2, "0")}
          </span>
          <Image
            src={icon}
            alt={`${title} logo`}
            width={480}
            height={280}
            unoptimized
            priority
            className="h-auto max-h-20 w-auto max-w-[min(100%,14rem)] object-contain sm:max-h-24 lg:max-h-28 short:max-h-16"
          />
        </div>

        <div className="grid min-h-0 gap-3 p-5 short:gap-2 short:py-4 sm:p-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              {period}
            </p>
            {featuredBadgeLabel ? (
              <span className="inline-flex h-6 items-center border border-primary bg-primary px-2 font-mono text-[9px] font-semibold tracking-wide text-primary-foreground uppercase">
                {featuredBadgeLabel}
              </span>
            ) : null}
          </div>
          <h3 className="font-heading text-xl font-semibold tracking-tight break-words sm:text-2xl lg:text-[1.65rem] short:text-xl">
            {title}
          </h3>
          <p className="text-base font-semibold leading-relaxed text-foreground short:text-base sm:text-lg">
            {outcome}
          </p>
        </div>

        <footer className="p-5 pt-0 sm:p-6 sm:pt-0 short:pb-4">
          <ProjectCardCta id={id} viewDetailsLabel={viewDetailsLabel} />
        </footer>
      </article>
    )
  }

  return (
    <article
      id={`project-${id}`}
      data-spotlight
      className={cn(
        "project-card group/card grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] border-3 border-border-brutal bg-card shadow-brutal-sm lg:grid-cols-[minmax(6.5rem,30%)_minmax(0,1fr)] lg:grid-rows-1",
        className
      )}
    >
      <div className="project-card-media grid place-items-center border-b border-border px-3 py-6 lg:border-r lg:border-b-0 lg:py-0">
        <span className="project-card-index" aria-hidden>
          {String(index).padStart(2, "0")}
        </span>
        <Image
          src={icon}
          alt={`${title} logo`}
          width={240}
          height={140}
          unoptimized
          className="h-auto max-h-12 w-auto max-w-[min(100%,9rem)] object-contain sm:max-h-14 lg:max-w-[min(100%,7rem)]"
        />
      </div>

      <div className="grid min-h-0 content-between gap-3 p-4 lg:p-5 short:py-3">
        <div className="grid min-h-0 gap-1.5">
          <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase sm:text-[11px]">
            {period}
          </p>
          <h3 className="font-heading text-base font-semibold tracking-tight break-words sm:text-lg xl:text-xl">
            {title}
          </h3>
          <p className="line-clamp-3 text-sm leading-snug text-foreground short:line-clamp-2">
            {outcome}
          </p>
        </div>
        <TransitionLink
          href={`/projects/${id}`}
          prefetch={false}
          className="system-link inline-flex min-h-11 w-fit items-center gap-1.5 after:absolute after:inset-0 after:content-[''] lg:min-h-0"
        >
          {viewDetailsLabel}
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover/card:translate-x-1 motion-reduce:transition-none"
            aria-hidden
          />
        </TransitionLink>
      </div>
    </article>
  )
}
