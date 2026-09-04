import type { ProjectId } from "@/data/projects"

export type BuildBlockLabelKey =
  | "frontend"
  | "backend"
  | "agents"
  | "rag"
  | "apis"
  | "automation"
  | "devops"
  | "mobile"

export type BuildBlock = {
  id: string
  labelKey: BuildBlockLabelKey
  /** Featured work that provides factual proof for this capability. */
  projectIds: readonly ProjectId[]
  /** Spawn column bias 0–1 across the stage width. */
  spawnX: number
}

/** High-level capabilities only — technology detail belongs in the stack section. */
export const buildBlocks: readonly BuildBlock[] = [
  {
    id: "frontend",
    labelKey: "frontend",
    projectIds: ["guscent", "uctalent", "unchainlabs", "matchtutors"],
    spawnX: 0.1,
  },
  {
    id: "backend",
    labelKey: "backend",
    projectIds: ["uctalent", "unchainlabs", "matchtutors"],
    spawnX: 0.23,
  },
  {
    id: "agents",
    labelKey: "agents",
    projectIds: ["uctalent", "matchtutors"],
    spawnX: 0.36,
  },
  {
    id: "rag",
    labelKey: "rag",
    projectIds: ["uctalent"],
    spawnX: 0.48,
  },
  {
    id: "apis",
    labelKey: "apis",
    projectIds: ["guscent", "uctalent", "unchainlabs", "matchtutors"],
    spawnX: 0.6,
  },
  {
    id: "automation",
    labelKey: "automation",
    projectIds: ["uctalent", "matchtutors"],
    spawnX: 0.72,
  },
  {
    id: "devops",
    labelKey: "devops",
    projectIds: ["matchtutors"],
    spawnX: 0.84,
  },
  {
    id: "mobile",
    labelKey: "mobile",
    projectIds: [],
    spawnX: 0.93,
  },
] as const
