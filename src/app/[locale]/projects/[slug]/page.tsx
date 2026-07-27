import { ArrowLeft, ArrowUpRight, GitBranch } from "lucide-react"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { DotSpotlightBackground } from "@/components/atoms/dot-spotlight-background"
import { PageGrid } from "@/components/atoms/page-grid"
import { SiteHeader } from "@/components/organisms/site-header"
import { Button } from "@/components/ui/button"
import { projectsContent } from "@/data/projects"
import { routing, type Locale } from "@/i18n/routing"

type PageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    projectsContent.map((project) => ({ locale, slug: project.id }))
  )
}

/**
 * Project case study — one viewport under the fixed header.
 * Highlights scroll inside the pane when they exceed remaining height.
 */
export default async function ProjectCaseStudyPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params
  if (!hasLocale(routing.locales, localeParam)) notFound()
  const locale = localeParam as Locale
  setRequestLocale(locale)

  const project = projectsContent.find((item) => item.id === slug)
  if (!project) notFound()

  const t = await getTranslations("projects")
  const tCase = await getTranslations("caseStudy")

  return (
    <div className="relative min-h-svh">
      <DotSpotlightBackground />
      <SiteHeader />
      <PageGrid className="relative z-10 box-border min-h-svh pb-4 lg:pb-8">
        <main className="col-span-10 grid gap-5 border-t border-border pt-3 sm:pt-4 lg:grid-cols-10 lg:gap-6 lg:pt-2">
          <div className="grid content-start gap-3 lg:col-span-4">
            <div>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer rounded-none"
                nativeButton={false}
                render={<a href={`/${locale}#projects`} />}
              >
                <ArrowLeft className="size-4" aria-hidden />
                {tCase("back")}
              </Button>
            </div>

            <header className="grid gap-2.5">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {project.period}
              </p>
              <h1 className="font-heading text-3xl tracking-tight md:text-4xl lg:text-5xl">
                {t(`items.${project.id}.title`)}
              </h1>
              <p className="text-sm font-medium text-foreground">
                <span
                  className="mr-2 inline-block size-1.5 bg-primary align-middle"
                  aria-hidden
                />
                {t(`items.${project.id}.role`)}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {t(`items.${project.id}.summary`)}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                {project.teamSize === 1
                  ? t("solo")
                  : t("teamSize", { count: project.teamSize })}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <Button
                  size="sm"
                  className="cursor-pointer rounded-none"
                  nativeButton={false}
                  render={
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  {t("live")}
                  <ArrowUpRight className="size-4" aria-hidden />
                </Button>
                {project.githubUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-none"
                    nativeButton={false}
                    render={
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <GitBranch className="size-4" aria-hidden />
                    {project.githubBackendUrl ? t("repoFrontend") : t("repo")}
                  </Button>
                ) : null}
                {project.githubBackendUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-none"
                    nativeButton={false}
                    render={
                      <a
                        href={project.githubBackendUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <GitBranch className="size-4" aria-hidden />
                    {t("repoBackend")}
                  </Button>
                ) : null}
              </div>
            </header>
          </div>

          <section className="grid gap-3 lg:col-span-6">
            <h2 className="font-heading text-xl tracking-tight md:text-2xl">
              {tCase("highlights")}
            </h2>
            <ol className="grid content-start gap-2 sm:gap-2.5">
              {project.highlightKeys.map((key, index) => (
                <li
                  key={key}
                  className="grid gap-2 border border-border bg-card p-3 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-3 sm:p-3.5"
                >
                  <span className="font-heading text-xl font-bold text-primary sm:text-2xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground">
                    {t(
                      `items.${project.id}.highlights.${key}` as Parameters<
                        typeof t
                      >[0]
                    )}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </main>
      </PageGrid>
    </div>
  )
}
