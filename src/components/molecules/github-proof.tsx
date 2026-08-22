import { getLocale, getTranslations } from "next-intl/server"

import { GithubActivity } from "@/components/molecules/github-activity"
import { contactLinks } from "@/data/contact"
import { getGithubStats } from "@/lib/github-stats"
import { formatCompact } from "@/lib/utils"

export function GithubProofSkeleton({ label }: { label: string }) {
  return (
    <aside
      className="grid min-h-[22rem] content-between gap-6 border border-border bg-card p-4 sm:p-5 lg:min-h-[25rem] lg:p-6"
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
      <aside className="grid min-h-[22rem] content-between gap-8 border border-border bg-card p-5 lg:min-h-[25rem] lg:p-6">
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
      label: t("collage.openPrs"),
      value: stats.openPullRequests.toLocaleString(locale),
    },
    { label: t("collage.stars"), value: formatCompact(stats.stars) },
  ]

  return (
    <aside className="grid min-h-[22rem] content-between gap-5 border border-border bg-card p-4 sm:p-5 lg:min-h-[25rem] lg:p-6">
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
