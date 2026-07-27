import { ScrollReveal } from "@/components/atoms/scroll-reveal"
import { ProjectCard } from "@/components/molecules/project-card"
import { projectsContent } from "@/data/projects"
import { VIEWPORT_UNDER_HEADER } from "@/data/site"
import { getTranslations } from "next-intl/server"

/**
 * Featured projects — content-sized on phone/tablet; one viewport on desktop.
 */
export async function ProjectsSection() {
  const t = await getTranslations("projects")

  return (
    <section
      id="projects"
      className={`page-section box-border content-start gap-y-4 border-t border-border pt-10 pb-10 sm:pt-12 sm:pb-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-5 lg:overflow-hidden lg:pb-8 ${VIEWPORT_UNDER_HEADER}`}
    >
      <header className="col-span-10 grid h-fit gap-y-2 self-start">
        <span className="w-fit justify-self-start border border-border bg-card px-4 py-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {t("badge")}
        </span>
        <div className="grid gap-1">
          <h2 className="font-heading text-2xl tracking-tight sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base lg:whitespace-nowrap">
            {t("description")}
          </p>
        </div>
      </header>

      <div className="col-span-10 grid min-h-0 content-start grid-cols-10 gap-x-[inherit] gap-y-4 lg:h-full lg:grid-rows-2 lg:gap-y-4">
        {projectsContent.map((project, index) => (
          <ScrollReveal
            key={project.id}
            className="col-span-10 min-h-0 lg:h-full"
            delayMs={index * 40}
          >
            <ProjectCard
              title={t(`items.${project.id}.title`)}
              role={t(`items.${project.id}.role`)}
              summary={t(`items.${project.id}.summary`)}
              period={project.period}
              teamSizeLabel={
                project.teamSize === 1
                  ? t("solo")
                  : t("teamSize", { count: project.teamSize })
              }
              stack={project.stack}
              highlights={project.highlightKeys.map((key) =>
                t(
                  `items.${project.id}.highlights.${key}` as Parameters<
                    typeof t
                  >[0]
                )
              )}
              liveUrl={project.liveUrl}
              liveLabel={t("live")}
              {...(project.githubUrl ? { githubUrl: project.githubUrl } : {})}
              {...(project.githubBackendUrl
                ? {
                    githubBackendUrl: project.githubBackendUrl,
                    repoLabel: t("repoFrontend"),
                    repoBackendLabel: t("repoBackend"),
                  }
                : { repoLabel: t("repo") })}
              caseStudyHref={`/projects/${project.id}`}
              caseStudyLabel={t("caseStudy")}
              className="lg:h-full"
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
