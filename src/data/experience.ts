export type ExperienceId = "uctalent" | "fsoft"

export type ExperienceItem = {
  id: ExperienceId
  period: string
  /** Message keys under `experience.items.<id>.bullets.*` */
  bulletKeys: readonly string[]
  /** Optional project / internship repo. */
  githubUrl?: string | undefined
}

/** Work experience — company/role/bullets copy in messages. */
export const experienceContent: readonly ExperienceItem[] = [
  {
    id: "uctalent",
    period: "03/2025 – Present",
    bulletKeys: [
      "production",
      "performance",
      "reliability",
      "endToEnd",
      "agile",
    ],
  },
  {
    id: "fsoft",
    period: "09/2024 – 11/2024",
    githubUrl: "https://github.com/bangd1nh/OJT-Project",
    bulletKeys: ["ojt", "fullstack", "delivery"],
  },
]
