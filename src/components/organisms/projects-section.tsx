import { getTranslations } from "next-intl/server"

import {
  SectionHeading,
  SectionWatermark,
} from "@/components/molecules/section-heading"
import { WorkIndex, type WorkIndexProject } from "@/components/organisms/work-index"
import { FEATURED_PROJECT_ID, projectsContent } from "@/data/projects"
import { VIEWPORT_SECTION } from "@/data/site"

const PROOF_PREVIEW = 4

/** Selected work — editorial index that drives a live project stage. */
export async function ProjectsSection() {
  const t = await getTranslations("projects")

  const projects: WorkIndexProject[] = projectsContent.map((project) => ({
    id: project.id,
    icon: project.icon,
    title: t(`items.${project.id}.title`),
    period: project.period,
    outcome: t(`items.${project.id}.outcome`),
    descriptor: t(`items.${project.id}.descriptor`),
    role: t(`items.${project.id}.role`),
    stack: project.stack,
    proof: project.proofKeys
      .slice(0, PROOF_PREVIEW)
      .map((key) => t(`proof.${key}`)),
    liveUrl: project.liveUrl,
    featured: project.id === FEATURED_PROJECT_ID,
  }))

  return (
    <section
      id="projects"
      data-screen
      className={`page-section box-border content-start gap-y-6 pt-10 pb-12 sm:pt-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-6 lg:py-8 short:gap-y-4 short:py-6 ${VIEWPORT_SECTION}`}
    >
      <SectionWatermark index={3} />
      <SectionHeading
        index={3}
        label={t("badge")}
        title={t("title")}
        description={t("description")}
        titleClassName="short:text-4xl"
        descriptionClassName="max-w-3xl"
      />
      <WorkIndex
        projects={projects}
        labels={{
          viewDetails: t("viewDetails"),
          live: t("live"),
          featured: t("featuredProjectBadge"),
          role: t("caseStudy.role"),
          stack: t("caseStudy.stack"),
          cursorView: t("cursorView"),
          cursorLive: t("cursorLive"),
        }}
      />
    </section>
  )
}
