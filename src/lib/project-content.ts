import {
  projectsContent,
  FEATURED_PROJECT_ID,
  type ProjectId,
  type ProjectItem,
} from "@/data/projects"
import { buildProjectGithubLinks } from "@/lib/project-github-links"

type ProjectsTranslate = (
  key: string,
  values?: Record<string, string | number>
) => string

function projectMessageKey(
  projectId: ProjectId,
  suffix: string
): `items.${ProjectId}.${string}` {
  return `items.${projectId}.${suffix}` as `items.${ProjectId}.${string}`
}

export function isProjectId(value: string): value is ProjectId {
  return projectsContent.some((project) => project.id === value)
}

export function getProjectById(id: ProjectId): ProjectItem | undefined {
  return projectsContent.find((project) => project.id === id)
}

export function mapProjectCard(project: ProjectItem, t: ProjectsTranslate) {
  return {
    id: project.id,
    icon: project.icon,
    title: t(projectMessageKey(project.id, "title")),
    period: project.period,
    outcome: t(projectMessageKey(project.id, "outcome")),
    featured: project.id === FEATURED_PROJECT_ID,
  }
}

export function mapProjectDetail(project: ProjectItem, t: ProjectsTranslate) {
  return {
    id: project.id,
    icon: project.icon,
    title: t(projectMessageKey(project.id, "title")),
    role: t(projectMessageKey(project.id, "role")),
    period: project.period,
    stack: project.stack,
    bullets: project.bulletKeys.map((key) =>
      t(projectMessageKey(project.id, `bullets.${key}`))
    ),
    caseStudies: project.highlightKeys.map((key) => ({
      label: t(`caseStudy.${key}`),
      text: t(projectMessageKey(project.id, `highlights.${key}`)),
    })),
    proof: [
      project.teamSize === 1
        ? t("solo")
        : t("teamSize", { count: project.teamSize }),
      ...project.proofKeys.map((key) => t(`proof.${key}`)),
    ],
    liveLinks: [
      { url: project.liveUrl, label: t("live") },
      ...(project.liveLinks?.map((link) => ({
        url: link.url,
        label: t(link.labelKey),
      })) ?? []),
    ],
    githubLinks: buildProjectGithubLinks(project, (key) => t(key)),
  }
}
