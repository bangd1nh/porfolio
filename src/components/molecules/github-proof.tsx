import { getLocale, getTranslations } from "next-intl/server"
import { ArrowUpRight } from "lucide-react"

import { GithubActivity } from "@/components/molecules/github-activity"
import { contactLinks } from "@/data/contact"
import { getGithubStats } from "@/lib/github-stats"

export function GithubProofSkeleton({ label }: { label: string }) {
  return (
    <aside
      id="github-activity"
      className="grid min-h-[22rem] content-between gap-6 border-3 border-border-brutal bg-card p-4 shadow-brutal sm:p-5 lg:min-h-[25rem] lg:p-6"
      aria-label={label}
      aria-busy="true"
    >
      <div className="grid gap-3">
        <span className="h-3 w-28 animate-pulse bg-muted motion-reduce:animate-none" />
        <span className="h-12 w-36 animate-pulse bg-muted motion-reduce:animate-none" />
      </div>
      <div className="grid gap-1.5" aria-hidden>
        {Array.from({ length: 7 }).map((_, row) => (
          <div key={row} className="flex gap-1.5">
            {Array.from({ length: 18 }).map((__, cell) => (
              <span
                key={cell}
                className="size-2.5 animate-pulse bg-muted motion-reduce:animate-none"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <span
            key={index}
            className="h-10 animate-pulse bg-muted motion-reduce:animate-none"
          />
        ))}
      </div>
    </aside>
  )
}

/** Streamed GitHub proof so the positioning copy never waits on the API. */
export async function GithubProof() {
  const t = await getTranslations("hero")
  const locale = await getLocale()
  const stats = await getGithubStats()

  if (!stats) {
    return (
      <aside
        id="github-activity"
        className="scroll-mt-20 grid min-h-[22rem] content-between gap-8 border-3 border-border-brutal bg-card p-5 shadow-brutal lg:min-h-[25rem] lg:p-6"
      >
        <header className="flex items-center justify-between gap-4">
          <p className="system-label">{t("github.proofLabel")}</p>
          <span className="font-mono text-[11px] text-muted-foreground">
            OFFLINE
          </span>
        </header>
        <div className="grid gap-3">
          <p className="font-heading text-2xl tracking-tight">
            {t("github.unavailableTitle")}
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("github.unavailableDescription")}
          </p>
        </div>
        <a
          href={contactLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="system-link w-fit"
        >
          {t("github.openProfile")} ↗
        </a>
      </aside>
    )
  }

  const metrics = [
    { label: t("collage.repos"), value: stats.repos.toLocaleString(locale) },
    {
      label: t("collage.organizations"),
      value: stats.organizations.length.toLocaleString(locale),
    },
    { label: t("collage.shippingSince"), value: "2024" },
  ]

  return (
    <aside
      id="github-activity"
      className="scroll-mt-20 grid min-h-[22rem] content-between gap-5 border-3 border-border-brutal bg-card p-4 shadow-brutal sm:p-5 lg:min-h-[25rem] lg:p-6"
    >
      <header className="flex items-center justify-between gap-4">
        <p className="system-label">{t("github.proofLabel")}</p>
        <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase">
          <span className="size-1.5 bg-primary" aria-hidden />
          {t("github.live")}
        </span>
      </header>

      <GithubActivity
        compact
        className="w-full border-0 bg-transparent p-0"
        contributions={stats.contributions}
        weeks={stats.weeks}
        organizations={stats.organizations}
        contributionsLabel={t("github.contributions")}
        organizationsLabel={t("github.organizations")}
        lessLabel={t("github.less")}
        moreLabel={t("github.more")}
        privateHint={stats.privateHidden ? t("github.privateHint") : null}
        locale={locale}
      />

      <dl className="grid grid-cols-3 border-t border-border pt-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={
              index > 0 ? "border-l border-border pl-3 sm:pl-4" : "pr-3"
            }
          >
            <dd className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              {metric.value}
            </dd>
            <dt className="mt-1 font-mono text-[10px] leading-tight tracking-[0.12em] text-muted-foreground uppercase">
              {metric.label}
            </dt>
          </div>
        ))}
      </dl>
    </aside>
  )
}

export function CurrentGithubPreviewSkeleton({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid content-start gap-3 p-4 sm:p-5">
      <p className="system-label">03 / {label}</p>
      <p className="currently-value">{value}</p>
    </div>
  )
}

/** Compact current-context link backed by the same hourly GitHub cache as the heatmap. */
export async function CurrentGithubPreview() {
  const t = await getTranslations("hero")
  const locale = await getLocale()
  const stats = await getGithubStats()

  if (!stats) {
    return (
      <a
        href="#github-activity"
        className="group grid h-full content-start gap-3 p-4 transition-colors duration-150 hover:bg-muted/60 dark:hover:bg-background dark:hover:ring-1 dark:hover:ring-inset dark:hover:ring-border motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
      >
        <p className="system-label">03 / {t("currently.githubLabel")}</p>
        <p className="currently-value">{t("currently.githubValue")}</p>
        <span className="system-link inline-flex items-center gap-1.5">
          {t("currently.githubOpen")}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </span>
      </a>
    )
  }

  const metrics = [
    {
      label: t("collage.contrib"),
      value: stats.contributions.toLocaleString(locale),
    },
    { label: t("collage.repos"), value: stats.repos.toLocaleString(locale) },
    {
      label: t("collage.organizations"),
      value: stats.organizations.length.toLocaleString(locale),
    },
  ]

  return (
    <a
      href="#github-activity"
      aria-label={t("currently.githubOpen")}
      className="group grid h-full content-start gap-3 p-4 transition-colors duration-150 hover:bg-muted/60 dark:hover:bg-background dark:hover:ring-1 dark:hover:ring-inset dark:hover:ring-border motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="system-label">03 / {t("currently.githubLabel")}</p>
        <ArrowUpRight
          className="size-3.5 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          aria-hidden
        />
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="grid gap-0.5">
            <dd className="font-heading text-lg font-semibold tracking-tight text-foreground">
              {metric.value}
            </dd>
            <dt className="font-mono text-[8px] leading-tight tracking-[0.08em] text-muted-foreground uppercase">
              {metric.label}
            </dt>
          </div>
        ))}
      </dl>
      <span className="system-link">{t("currently.githubOpen")}</span>
    </a>
  )
}
