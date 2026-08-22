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
        <p className="system-label text-foreground">SYSTEM / {t("badge")}</p>
        <div className="grid gap-1 lg:gap-0.5">
          <h2 className="section-title lg:text-4xl">{t("title")}</h2>
          <p className="section-description lg:text-sm">
            {t("description")}
          </p>
        </div>
      </header>

      <ScrollReveal className="col-span-10 grid min-h-0 h-full">
        <ProjectsShowcase
          projects={projects}
          tabsLabel={t("tabsLabel")}
          shippedLabel={t("shipped")}
          notesHint={t("notesHint")}
          shippingPressLabels={{
            ticket: t("shippingPress.ticket"),
            building: t("shippingPress.building"),
            scanning: t("shippingPress.scanning"),
            shipped: t("shippingPress.shipped"),
            archive: t("shippingPress.archive"),
          }}
          embedFallback={t("embedFallback")}
        />
      </ScrollReveal>
    </section>
  )
}
