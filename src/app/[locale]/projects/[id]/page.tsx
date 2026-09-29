import { ArrowLeft, ArrowRight, ArrowUpRight, GitBranch } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { CustomCursor } from "@/components/atoms/custom-cursor"
import { DotField } from "@/components/atoms/dot-field"
import { Marquee } from "@/components/atoms/marquee"
import { PageGrid } from "@/components/atoms/page-grid"
import { SkillIcon } from "@/components/atoms/skill-icon"
import { SplitWords } from "@/components/atoms/split-words"
import { CaseStudyToc } from "@/components/molecules/case-study-toc"
import { HeroReveal } from "@/components/molecules/hero-reveal"
import { sortStackForHr } from "@/components/molecules/project-details-panel"
import { TransitionLink } from "@/components/molecules/transition-link"
import { SiteDock } from "@/components/organisms/site-dock"
import { PageMotion } from "@/components/providers/page-motion"
import { Button } from "@/components/ui/button"
import { FEATURED_PROJECT_ID, projectsContent } from "@/data/projects"
import { routing, type Locale } from "@/i18n/routing"
import {
  getProjectById,
  isProjectId,
  mapProjectDetail,
} from "@/lib/project-content"
import { buildPageMetadata } from "@/lib/seo"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

const pad = (value: number) => String(value).padStart(2, "0")
const hostOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "")

/** "Lead: a, b and c." → { lead, items } — powers the deliverables grid. */
function splitDeliverables(text: string) {
  const colon = text.indexOf(":")
  const lead = colon > 0 ? text.slice(0, colon).trim() : null
  const body = (colon > 0 ? text.slice(colon + 1) : text).trim().replace(/\.$/, "")
  const items = body
    .split(/,\s*(?:(?:và|and)\s+)?|\s+(?:và|and)\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
  return { lead, items }
}

/** Decisions copy is a semicolon list — one card per decision. */
function splitDecisions(text: string) {
  return text
    .split(";")
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter(Boolean)
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    projectsContent.map((project) => ({
      locale,
      id: project.id,
    }))
  )
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: localeParam, id } = await params

  if (!hasLocale(routing.locales, localeParam) || !isProjectId(id)) {
    return {}
  }

  const locale = localeParam as Locale
  const t = await getTranslations({ locale, namespace: "projects" })
  const project = getProjectById(id)
  if (!project) return {}

  return buildPageMetadata({
    locale,
    path: `/projects/${id}`,
    title: t(`items.${project.id}.title`),
    description: t(`items.${project.id}.summary`),
  })
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale: localeParam, id } = await params
  if (!hasLocale(routing.locales, localeParam) || !isProjectId(id)) {
    notFound()
  }

  const locale = localeParam as Locale
  setRequestLocale(locale)

  const project = getProjectById(id)
  if (!project) notFound()

  const t = await getTranslations("projects")
  const detail = mapProjectDetail(project, (key, values) =>
    t(key as Parameters<typeof t>[0], values)
  )

  const index = projectsContent.findIndex((item) => item.id === project.id)
  const total = projectsContent.length
  const next = projectsContent[(index + 1) % total]!
  const prev = projectsContent[(index - 1 + total) % total]!

  const outcome = t(`items.${project.id}.outcome`)
  const summary = t(`items.${project.id}.summary`)
  const descriptor = t(`items.${project.id}.descriptor`)
  const [teamLabel, ...proof] = detail.proof
  const stack = sortStackForHr(detail.stack)
  const primaryLive = detail.liveLinks[0]

  const caseText = (key: string) =>
    project.highlightKeys.includes(key)
      ? t(`items.${project.id}.highlights.${key}` as Parameters<typeof t>[0])
      : ""
  const shipped = splitDeliverables(caseText("shipped"))
  const decisions = splitDecisions(caseText("decisions"))
  const impact = caseText("impact")

  const chapters = [
    { id: "highlights", label: t("keyHighlights") },
    { id: "shipped", label: t("caseStudy.shipped") },
    { id: "decisions", label: t("caseStudy.decisions") },
    { id: "impact", label: t("caseStudy.impact") },
    { id: "stack", label: t("caseStudy.stack") },
  ]

  const facts = [
    { label: t("factRole"), value: detail.role },
    { label: t("factPeriod"), value: detail.period },
    { label: t("factTeam"), value: teamLabel ?? "" },
    { label: t("factDomain"), value: descriptor },
  ]

  return (
    <div className="relative min-h-full">
      <DotField />
      <SiteDock />
      <CustomCursor />
      <PageMotion />
      <PageGrid className="relative z-10">
        <main className="contents">
          {/* ——— Hero ——— */}
          <section className="page-section relative isolate min-h-svh content-start gap-y-8 overflow-x-clip pt-8 pb-10 lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:pt-[calc(var(--site-dock-height)+var(--site-dock-offset)+1.5rem)] short:gap-y-5 short:pb-6">
            <nav className="col-span-10 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="group min-h-10 rounded-none px-4"
                nativeButton={false}
                render={<TransitionLink href="/#projects" prefetch={false} />}
              >
                <ArrowLeft
                  data-icon="inline-start"
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                  aria-hidden
                />
                {t("backToWork")}
              </Button>
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                {t("caseStudyLabel")}
                <span className="mx-2 text-primary" aria-hidden>
                  /
                </span>
                <span className="text-foreground">{pad(index + 1)}</span> / {pad(total)}
              </p>
            </nav>

            <HeroReveal className="col-span-10 grid min-h-0 grid-cols-10 content-center gap-x-[var(--page-col-gap)] gap-y-10">
              <div className="col-span-10 grid min-w-0 content-center gap-6 lg:col-span-6 lg:pr-6 short:gap-4">
                <p
                  data-hero-reveal
                  className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
                >
                  <span className="pulse-dot size-2 bg-primary" aria-hidden />
                  {descriptor}
                  {project.id === FEATURED_PROJECT_ID ? (
                    <span className="bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                      {t("featuredProjectBadge")}
                    </span>
                  ) : null}
                </p>
                <h1
                  data-hero-headline
                  className="font-heading text-[clamp(2.1rem,min(6vw,9svh),5.5rem)] leading-[1.02] font-bold tracking-[-0.04em] text-balance [overflow-wrap:anywhere]"
                >
                  <SplitWords text={detail.title} />
                </h1>
                <p
                  data-hero-reveal
                  className="max-w-2xl border-l-4 border-primary pl-4 font-heading text-xl leading-snug font-semibold tracking-tight sm:text-2xl short:text-xl"
                >
                  {outcome}
                </p>
                <p
                  data-hero-reveal
                  className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base short:line-clamp-2"
                >
                  {summary}
                </p>
                <div data-hero-reveal className="flex flex-wrap gap-2 sm:gap-3">
                  {detail.liveLinks.map((link, linkIndex) => (
                    <span key={link.url} data-magnetic="0.25" className="inline-flex">
                      <Button
                        variant={linkIndex === 0 ? "default" : "outline"}
                        className="min-h-11 rounded-none px-5"
                        nativeButton={false}
                        render={<a href={link.url} target="_blank" rel="noopener noreferrer" />}
                      >
                        {link.label}
                        <ArrowUpRight data-icon="inline-end" aria-hidden />
                      </Button>
                    </span>
                  ))}
                  {detail.githubLinks.map((link) => (
                    <span key={link.url} data-magnetic="0.25" className="inline-flex">
                      <Button
                        variant="outline"
                        className="min-h-11 rounded-none px-5"
                        nativeButton={false}
                        render={<a href={link.url} target="_blank" rel="noopener noreferrer" />}
                      >
                        <GitBranch data-icon="inline-start" aria-hidden />
                        {link.label}
                      </Button>
                    </span>
                  ))}
                </div>
              </div>

              <div data-hero-reveal className="col-span-10 grid min-h-0 lg:col-span-4">
                <article
                  data-spotlight
                  className="grid min-h-[20rem] grid-rows-[auto_minmax(0,1fr)_auto] border-3 border-border-brutal bg-card shadow-brutal lg:h-full lg:max-h-[34rem] lg:min-h-[18rem]"
                >
                  <header className="flex items-center gap-3 border-b-2 border-border-brutal px-4 py-2.5">
                    <span className="flex gap-1.5" aria-hidden>
                      <span className="size-2.5 bg-primary" />
                      <span className="size-2.5 border border-foreground/40" />
                      <span className="size-2.5 border border-foreground/40" />
                    </span>
                    <span className="min-w-0 flex-1 truncate border border-foreground/15 px-2.5 py-1 font-mono text-[11px] text-foreground">
                      <span className="text-foreground/40">https://</span>
                      {primaryLive ? hostOf(primaryLive.url) : ""}
                    </span>
                  </header>
                  <a
                    href={primaryLive?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label={t("cursorLive")}
                    aria-label={`${t("live")}: ${detail.title}`}
                    className="work-stage-media relative grid min-h-0 place-items-center overflow-hidden"
                  >
                    <span className="work-stage-number" aria-hidden>
                      {pad(index + 1)}
                    </span>
                    <span className="work-stage-sticker case-sticker relative grid place-items-center">
                      <Image
                        src={detail.icon}
                        alt={`${detail.title} logo`}
                        width={360}
                        height={220}
                        unoptimized
                        priority
                        className="h-auto max-h-28 w-auto max-w-[12rem] object-contain short:max-h-20"
                      />
                    </span>
                  </a>
                  <ul className="flex flex-wrap gap-1.5 border-t-2 border-border-brutal px-4 py-3">
                    {proof.map((item) => (
                      <li
                        key={item}
                        className="border border-primary/60 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide uppercase"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </HeroReveal>

            <dl
              data-reveal-group
              className="col-span-10 grid grid-cols-2 border-y-2 border-border-brutal lg:grid-cols-4"
            >
              {facts.map((fact, factIndex) => (
                <div
                  key={fact.label}
                  className={`grid content-start gap-1.5 py-4 short:py-3 ${factIndex % 2 === 1 ? "border-l-2 border-border-brutal pl-4" : "pr-4"} ${factIndex > 1 ? "border-t-2 border-border-brutal lg:border-t-0" : ""} ${factIndex === 2 ? "lg:border-l-2 lg:pl-4" : ""}`}
                >
                  <dt className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                    <span className="mr-2 text-primary">{pad(factIndex + 1)}</span>
                    {fact.label}
                  </dt>
                  <dd className="text-sm font-semibold sm:text-base">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ——— Stack ticker ——— */}
          <div className="col-span-10 border-b-2 border-border-brutal py-5" aria-hidden>
            <Marquee duration={35}>
              {stack.map((tech) => (
                <span key={tech} className="flex items-center gap-[var(--marquee-gap)]">
                  <span className="stack-ticker-item">{tech}</span>
                  <span className="size-2.5 rotate-45 bg-primary" />
                </span>
              ))}
            </Marquee>
          </div>

          {/* ——— Chapters ——— */}
          <section className="page-section relative gap-y-10 py-16 lg:py-24">
            <aside className="col-span-10 hidden lg:col-span-3 lg:block">
              <CaseStudyToc
                label={t("contents")}
                chapters={chapters}
                className="sticky top-[calc(var(--site-dock-height)+var(--site-dock-offset)+2rem)]"
              />
            </aside>

            <div className="col-span-10 grid gap-20 lg:col-span-7 lg:gap-28">
              <Chapter id="highlights" index={1} label={chapters[0]!.label}>
                <ol data-reveal-group className="grid gap-3 sm:grid-cols-2">
                  {detail.bullets.map((bullet, bulletIndex) => (
                    <li
                      key={bullet}
                      data-spotlight
                      className="case-card grid content-start gap-4 border-3 border-border-brutal bg-card p-5 shadow-brutal-sm sm:[&:last-child:nth-child(odd)]:col-span-2"
                    >
                      <span className="font-heading text-4xl leading-none font-bold tracking-tighter text-primary">
                        {pad(bulletIndex + 1)}
                      </span>
                      <p className="text-base leading-relaxed">{bullet}</p>
                    </li>
                  ))}
                </ol>
              </Chapter>

              <Chapter id="shipped" index={2} label={chapters[1]!.label}>
                {shipped.lead ? (
                  <p
                    data-reveal="up"
                    className="font-heading text-2xl leading-snug font-semibold tracking-tight sm:text-3xl"
                  >
                    {shipped.lead}
                    <span className="ml-3 align-middle font-mono text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                      {pad(shipped.items.length)} {t("deliverables")}
                    </span>
                  </p>
                ) : null}
                <ul
                  data-reveal-group
                  data-reveal-stagger="0.04"
                  className="grid grid-cols-1 border-t-2 border-l-2 border-border-brutal sm:grid-cols-2 xl:grid-cols-3"
                >
                  {shipped.items.map((item, itemIndex) => (
                    <li
                      key={item}
                      className="skill-wipe grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-2 border-r-2 border-b-2 border-border-brutal px-4 py-4 text-sm font-semibold sm:text-base"
                    >
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">
                        {pad(itemIndex + 1)}
                      </span>
                      <span className="first-letter:uppercase">{item}</span>
                    </li>
                  ))}
                </ul>
              </Chapter>

              <Chapter id="decisions" index={3} label={chapters[2]!.label}>
                <ol data-reveal-group className="grid gap-0">
                  {decisions.map((decision, decisionIndex) => (
                    <li
                      key={decision}
                      className="case-decision group/decision grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 border-b border-border py-6 first:border-t sm:grid-cols-[5rem_minmax(0,1fr)]"
                    >
                      <span className="case-decision-index font-heading text-4xl leading-none font-bold tracking-tighter sm:text-5xl">
                        {pad(decisionIndex + 1)}
                      </span>
                      <p className="self-center font-heading text-lg leading-snug font-semibold tracking-tight first-letter:uppercase sm:text-xl">
                        {decision}
                      </p>
                    </li>
                  ))}
                </ol>
              </Chapter>

              <Chapter id="impact" index={4} label={chapters[3]!.label}>
                <blockquote className="relative border-3 border-border-brutal bg-card p-6 shadow-brutal sm:p-10">
                  <span
                    className="absolute -top-7 left-6 font-heading text-8xl leading-none font-bold text-primary"
                    aria-hidden
                  >
                    “
                  </span>
                  <p
                    data-reveal="words"
                    className="font-heading text-2xl leading-[1.3] font-semibold tracking-tight text-balance sm:text-3xl xl:text-4xl"
                  >
                    <SplitWords text={impact} />
                  </p>
                </blockquote>
              </Chapter>

              <Chapter id="stack" index={5} label={chapters[4]!.label}>
                <ul
                  data-reveal-group
                  data-reveal-stagger="0.04"
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
                >
                  {stack.map((tech) => (
                    <li
                      key={tech}
                      className="skill-wipe grid justify-items-start gap-4 border-2 border-border-brutal bg-card p-4 shadow-brutal-sm"
                    >
                      <SkillIcon name={tech} className="size-6 text-muted-foreground" />
                      <span className="font-heading text-base font-semibold tracking-tight sm:text-lg">
                        {tech}
                      </span>
                    </li>
                  ))}
                </ul>
              </Chapter>
            </div>
          </section>

          {/* ——— Next / previous ——— */}
          <section className="page-section border-t-2 border-border-brutal">
            <TransitionLink
              href={`/projects/${next.id}`}
              prefetch={false}
              data-cursor-label={t("cursorNext")}
              data-cursor-tone="dark"
              className="case-next group/next relative col-span-10 grid gap-6 py-14 sm:py-20"
            >
              <span className="relative z-1 flex items-center justify-between gap-4 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase transition-colors group-hover/next:text-primary-foreground">
                <span>
                  {t("nextProject")}
                  <span className="mx-2" aria-hidden>
                    /
                  </span>
                  {pad(((index + 1) % total) + 1)}
                </span>
                <span>{t(`items.${next.id}.descriptor`)}</span>
              </span>
              <span className="relative z-1 flex items-center justify-between gap-6">
                <span className="min-w-0 font-heading text-[clamp(2.25rem,8vw,7.5rem)] leading-[0.95] font-bold tracking-[-0.05em] [overflow-wrap:anywhere] transition-colors group-hover/next:text-primary-foreground">
                  {t(`items.${next.id}.title`)}
                </span>
                <span className="grid size-16 shrink-0 place-items-center border-3 border-border-brutal bg-card shadow-brutal transition-transform duration-500 group-hover/next:-rotate-45 sm:size-24">
                  <ArrowRight className="size-6 sm:size-9" aria-hidden />
                </span>
              </span>
            </TransitionLink>
            <div className="col-span-10 flex flex-wrap items-center justify-between gap-3 border-t border-border py-5 pb-24 lg:pb-6">
              <TransitionLink
                href={`/projects/${prev.id}`}
                prefetch={false}
                className="system-link inline-flex min-h-11 items-center gap-2"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                {t("prevProject")}: {t(`items.${prev.id}.title`)}
              </TransitionLink>
              <TransitionLink
                href="/#projects"
                prefetch={false}
                className="system-link inline-flex min-h-11 items-center gap-2"
              >
                {t("backToWork")}
              </TransitionLink>
            </div>
          </section>
        </main>
      </PageGrid>
    </div>
  )
}

function Chapter({
  id,
  index,
  label,
  children,
}: {
  id: string
  index: number
  label: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="grid scroll-mt-[calc(var(--site-dock-height)+var(--site-dock-offset)+2rem)] gap-8"
    >
      <header className="grid gap-3">
        <div data-reveal="up" className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-bold text-primary">{pad(index)}</span>
          <span data-reveal="draw" className="h-px w-10 bg-foreground/50" aria-hidden />
        </div>
        <h2 data-reveal="title" className="section-title">
          <SplitWords text={label} />
        </h2>
      </header>
      {children}
    </section>
  )
}
