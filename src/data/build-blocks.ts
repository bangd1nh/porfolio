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
  /** Spawn column bias 0–1 across the stage width. */
  spawnX: number
}

/** High-level capabilities only — technology detail belongs in the stack section. */
export const buildBlocks: readonly BuildBlock[] = [
  { id: "frontend", labelKey: "frontend", spawnX: 0.1 },
  { id: "backend", labelKey: "backend", spawnX: 0.23 },
  { id: "agents", labelKey: "agents", spawnX: 0.36 },
  { id: "rag", labelKey: "rag", spawnX: 0.48 },
  { id: "apis", labelKey: "apis", spawnX: 0.6 },
  { id: "automation", labelKey: "automation", spawnX: 0.72 },
  { id: "devops", labelKey: "devops", spawnX: 0.84 },
  { id: "mobile", labelKey: "mobile", spawnX: 0.93 },
] as const
