export type BuildBlockOrientation = "horizontal" | "vertical"

export type BuildBlockLabelKey =
  | "uiux"
  | "backend"
  | "aiml"
  | "microservices"
  | "automation"
  | "devops"
  | "frontend"
  | "data"
  | "qa"
  | "mobile"
  | "api"
  | "desktop"
  | "cloud"
  | "web"

export type BuildBlock = {
  id: string
  labelKey: BuildBlockLabelKey
  orientation: BuildBlockOrientation
  /** Spawn column bias 0–1 across the stage width. */
  spawnX: number
}

/** Things I can build — physics chips for the contact CTA stage. */
export const buildBlocks: readonly BuildBlock[] = [
  { id: "uiux", labelKey: "uiux", orientation: "horizontal", spawnX: 0.08 },
  { id: "backend", labelKey: "backend", orientation: "horizontal", spawnX: 0.18 },
  { id: "aiml", labelKey: "aiml", orientation: "vertical", spawnX: 0.3 },
  {
    id: "microservices",
    labelKey: "microservices",
    orientation: "horizontal",
    spawnX: 0.4,
  },
  {
    id: "automation",
    labelKey: "automation",
    orientation: "horizontal",
    spawnX: 0.52,
  },
  { id: "devops", labelKey: "devops", orientation: "horizontal", spawnX: 0.64 },
  {
    id: "frontend",
    labelKey: "frontend",
    orientation: "horizontal",
    spawnX: 0.76,
  },
  { id: "data", labelKey: "data", orientation: "horizontal", spawnX: 0.12 },
  { id: "qa", labelKey: "qa", orientation: "horizontal", spawnX: 0.28 },
  { id: "mobile", labelKey: "mobile", orientation: "horizontal", spawnX: 0.46 },
  { id: "api", labelKey: "api", orientation: "vertical", spawnX: 0.58 },
  {
    id: "desktop",
    labelKey: "desktop",
    orientation: "horizontal",
    spawnX: 0.7,
  },
  { id: "cloud", labelKey: "cloud", orientation: "vertical", spawnX: 0.84 },
  { id: "web", labelKey: "web", orientation: "horizontal", spawnX: 0.92 },
] as const
