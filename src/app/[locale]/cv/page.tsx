import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { DotSpotlightBackground } from "@/components/atoms/dot-spotlight-background"
import { JsonLd } from "@/components/atoms/json-ld"
import { PageGrid } from "@/components/atoms/page-grid"
import { PrintButton } from "@/components/atoms/print-button"
import { SkillIcon } from "@/components/atoms/skill-icon"
import { TransitionLink } from "@/components/molecules/transition-link"
import { SiteDock } from "@/components/organisms/site-dock"
import { Button } from "@/components/ui/button"
import { contactLinks } from "@/data/contact"
import { experienceContent } from "@/data/experience"
import { profileContent } from "@/data/profile"
import { projectsContent } from "@/data/projects"
import { routing, type Locale } from "@/i18n/routing"
import { buildPageMetadata, getCvJsonLd } from "@/lib/seo"

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!hasLocale(routing.locales, localeParam)) {
    return {}
  }

  const locale = localeParam as Locale
  const t = await getTranslations({ locale, namespace: "metadata" })

  return buildPageMetadata({
    locale,
    path: "/cv",
    title: t("cv.title"),
    description: t("cv.description"),
  })
}

type LocaleKey = "en" | "vi"

/**
 * Printable CV — use Print / Save as PDF. Drop `public/resume.pdf` for a static file later.
 */
export default async function CvPage({ params }: PageProps) {
  const { locale: localeParam } = await params
  if (!hasLocale(routing.locales, localeParam)) notFound()
  const locale = localeParam as Locale
  setRequestLocale(locale)

  const t = await getTranslations("cv")
  const tMetadata = await getTranslations("metadata")
  const tProfile = await getTranslations("profile")
  const tExperience = await getTranslations("experience")
  const tProjects = await getTranslations("projects")
  const loc = (await getLocale()) as LocaleKey
  const { name, role, location, education, skills, birth } = profileContent

  return (
    <div className="relative min-h-full">
      <JsonLd
        data={getCvJsonLd(locale, {
          home: tMetadata("ogSiteName"),
          cv: tMetadata("cv.title"),
        })}
      />
      <div className="print:hidden">
        <DotSpotlightBackground />
        <SiteDock />
      </div>
      <PageGrid className="relative z-10 pb-16">
        <main className="col-span-10 grid gap-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Button
              variant="outline"
              className="cursor-pointer rounded-none"
              nativeButton={false}
              render={<TransitionLink href="/" />}
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t("back")}
            </Button>
            <PrintButton label={t("print")} />
          </div>

          <article className="grid gap-8 border border-border bg-card p-6 md:p-10 print:border-0 print:bg-white print:p-0 print:text-black">
            <header className="grid gap-2 border-b border-border pb-6">
              <h1 className="font-heading text-3xl tracking-tight md:text-4xl">
                {name[loc]}
              </h1>
              <p className="text-base font-medium">{role[loc]}</p>
              <p className="text-sm text-muted-foreground print:text-neutral-600">
                {location[loc]} · {birth} · {contactLinks.email}
              </p>
              <p className="text-sm text-muted-foreground print:text-neutral-600">
                {contactLinks.github}
              </p>
            </header>

            <section className="grid gap-3">
              <h2 className="font-heading text-xl tracking-tight">
                {tProfile("fields.education")}
              </h2>
              <p className="text-sm">{education[loc]}</p>
            </section>

            <section className="grid gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                {tExperience("title")}
              </h2>
              {experienceContent.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 border-l-2 border-primary pl-4"
                >
                  <div className="grid gap-0.5 sm:grid-cols-[1fr_auto]">
                    <h3 className="font-semibold">
                      {tExperience(`items.${item.id}.company`)} —{" "}
                      {tExperience(`items.${item.id}.role`)}
                    </h3>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      {item.period}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground print:text-neutral-600">
                    {tExperience(`items.${item.id}.summary`)}
                  </p>
                  <ul className="grid gap-1.5">
                    {item.bulletKeys.map((key) => (
                      <li key={key} className="text-sm">
                        {tExperience(
                          `items.${item.id}.bullets.${key}` as Parameters<
                            typeof tExperience
                          >[0]
                        )}
                      </li>
                    ))}
                  </ul>
                  {item.githubUrl ? (
                    <p className="text-xs font-semibold">
                      <a
                        href={item.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {tExperience("repo")}
                      </a>
                    </p>
                  ) : null}
                </div>
              ))}
            </section>

            <section className="grid gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                {tProjects("title")}
              </h2>
              {projectsContent.map((project) => (
                <div key={project.id} className="grid gap-2">
                  <div className="grid gap-0.5 sm:grid-cols-[1fr_auto]">
                    <h3 className="font-semibold">
                      {tProjects(`items.${project.id}.title`)} —{" "}
                      {tProjects(`items.${project.id}.role`)}
                    </h3>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      {project.period}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground print:text-neutral-600">
                    {tProjects(`items.${project.id}.summary`)}
                  </p>
                  <p className="text-xs font-semibold">
                    {project.stack.join(" · ")}
                  </p>
                  <p className="text-xs text-muted-foreground print:text-neutral-600">
                    {project.teamSize === 1
                      ? tProjects("solo")
                      : tProjects("teamSize", { count: project.teamSize })}
                    {" · "}
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      {tProjects("live")}
                    </a>
                  </p>
                </div>
              ))}
            </section>

            <section className="grid gap-4">
              <h2 className="font-heading text-xl tracking-tight">{t("skills")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {skills.map((group) => (
                  <div key={group.id} className="grid gap-2">
                    <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      {tProfile(`skills.${group.id}`)}
                    </h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 text-xs font-semibold print:border-neutral-300 print:bg-transparent"
                        >
                          <SkillIcon name={item} className="print:hidden" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </main>
      </PageGrid>
    </div>
  )
}
