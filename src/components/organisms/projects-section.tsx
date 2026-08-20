import { ScrollReveal } from "@/components/atoms/scroll-reveal"
import { ProjectsShowcase } from "@/components/organisms/projects-showcase"
import { projectsContent } from "@/data/projects"
import { VIEWPORT_SECTION } from "@/data/site"
import { getTranslations } from "next-intl/server"

/**
 * Featured projects — embed left, shipped highlights right; one viewport on desktop.
 */
export async function ProjectsSection() {
  const t = await getTranslations("projects")

  const projects = projectsContent.map((project) => ({
    id: project.id,
    title: t(`items.${project.id}.title`),
    role: t(`items.${project.id}.role`),
    summary: t(`items.${project.id}.summary`),
    period: project.period,
    teamSizeLabel:
      project.teamSize === 1
        ? t("solo")
        : t("teamSize", { count: project.teamSize }),
    stack: project.stack,
    highlights: project.highlightKeys.map((key) =>
      t(
        `items.${project.id}.highlights.${key}` as Parameters<typeof t>[0]
      )
    ),
    liveUrl: project.liveUrl,
    liveLabel: t("live"),
  }))

  return (
    <section
      id="projects"
      className={`page-section box-border gap-y-4 border-t border-border pt-10 pb-10 sm:pt-12 sm:pb-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:content-stretch lg:gap-y-3 lg:pb-6 ${VIEWPORT_SECTION}`}
    >
      <header className="col-span-10 grid h-fit shrink-0 gap-y-2 self-start lg:gap-y-1.5">
        <span className="w-fit justify-self-start border border-border bg-card px-4 py-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase lg:px-3 lg:py-1.5 lg:text-[10px]">
          {t("badge")}
        </span>
        <div className="grid gap-1 lg:gap-0.5">
          <h2 className="font-heading text-2xl tracking-tight sm:text-3xl lg:text-3xl">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base lg:text-sm lg:whitespace-nowrap">
            {t("description")}
          </p>
        </div>
      </header>

      <ScrollReveal className="col-span-10 grid min-h-0 h-full">
        <ProjectsShowcase
          projects={projects}
          tabsLabel={t("tabsLabel")}
          shippedLabel={t("shipped")}
          embedFallback={t("embedFallback")}
        />
      </ScrollReveal>
    </section>
  )
}
