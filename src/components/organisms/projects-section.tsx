import { ScrollReveal } from "@/components/atoms/scroll-reveal"
import { ProjectsShowcase } from "@/components/organisms/projects-showcase"
import { projectsContent } from "@/data/projects"
import { resolveEmbedAllowed } from "@/lib/embeddability"
import { VIEWPORT_SECTION } from "@/data/site"
import { getTranslations } from "next-intl/server"

/**
 * Featured projects — embed left, shipped highlights right; one viewport on desktop.
 */
export async function ProjectsSection() {
  const t = await getTranslations("projects")

  const projects = await Promise.all(
    projectsContent.map(async (project) => ({
      id: project.id,
      title: t(`items.${project.id}.title`),
      descriptor: t(`items.${project.id}.descriptor`),
      role: t(`items.${project.id}.role`),
      summary: t(`items.${project.id}.summary`),
      period: project.period,
      teamSizeLabel:
        project.teamSize === 1
          ? t("solo")
          : t("teamSize", { count: project.teamSize }),
      stack: project.stack,
      proof: project.proofKeys.map((key) =>
        t(`proof.${key}` as Parameters<typeof t>[0])
      ),
      highlights: project.highlightKeys.map((key) => ({
        label: t(`caseStudy.${key}` as Parameters<typeof t>[0]),
        text: t(
          `items.${project.id}.highlights.${key}` as Parameters<typeof t>[0]
        ),
      })),
      liveLinks: [
        { url: project.liveUrl, label: t("live") },
        ...(project.liveLinks?.map((link) => ({
          url: link.url,
          label: t(link.labelKey as Parameters<typeof t>[0]),
        })) ?? []),
      ],
      previewType: project.previewType,
      previewImage: project.previewImage,
      embedAllowed: await resolveEmbedAllowed(
        project.liveUrl,
        project.previewType
      ),
    }))
  )

  return (
    <section
      id="projects"
      className={`page-section box-border gap-y-4 border-t border-border pt-10 pb-10 sm:pt-12 sm:pb-12 lg:grid-rows-[minmax(0,1fr)] lg:content-stretch lg:gap-y-3 lg:pb-6 [@media(min-width:1024px)_and_(max-height:50rem)]:gap-y-2 [@media(min-width:1024px)_and_(max-height:50rem)]:pt-6 [@media(min-width:1024px)_and_(max-height:50rem)]:pb-4 ${VIEWPORT_SECTION}`}
    >
      <ScrollReveal className="col-span-10 grid min-h-0 h-full lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-3">
        <ProjectsShowcase
          projects={projects}
          sectionLabel={`SYSTEM / ${t("badge")}`}
          sectionTitle={t("title")}
          sectionDescription={t("description")}
          tabsLabel={t("tabsLabel")}
          shippedLabel={t("shipped")}
          contextLabel={t("caseStudy.context")}
          roleLabel={t("caseStudy.role")}
          stackLabel={t("caseStudy.stack")}
          proofLabel={t("proofLabel")}
          detailsCardLabel={t("detailsCard")}
          expandHint={t("expandHint")}
          notesHint={t("notesHint")}
          shippingPressLabels={{
            ticket: t("shippingPress.ticket"),
            building: t("shippingPress.building"),
            scanning: t("shippingPress.scanning"),
            shipped: t("shippingPress.shipped"),
            archive: t("shippingPress.archive"),
          }}
        />
      </ScrollReveal>
    </section>
  )
}
