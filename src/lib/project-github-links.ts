import type { ProjectItem } from "@/data/projects"

type TranslateProjects = (
  key: "repo" | "repoFrontend" | "repoBackend"
) => string

/** Map project repos to labeled outbound links for the details panel. */
export function buildProjectGithubLinks(
  project: ProjectItem,
  t: TranslateProjects
): Array<{ url: string; label: string }> {
  const links: Array<{ url: string; label: string }> = []

  if (project.githubBackendUrl && project.githubUrl) {
    links.push({ url: project.githubUrl, label: t("repoFrontend") })
    links.push({ url: project.githubBackendUrl, label: t("repoBackend") })
  } else if (project.githubUrl) {
    links.push({ url: project.githubUrl, label: t("repo") })
  }

  return links
}
