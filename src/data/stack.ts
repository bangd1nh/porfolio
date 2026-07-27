import type { ProfileSkillGroup } from "@/data/profile"
import { profileContent } from "@/data/profile"

export type StackGroupId = ProfileSkillGroup["id"]

/** Featured groups — primary stack showcase on the homepage. */
export const featuredStackGroupIds = [
  "languages",
  "frameworks",
  "databases",
  "api",
  "ai",
] as const satisfies readonly StackGroupId[]

/** Secondary groups under Featured stack. */
export const moreStackGroupIds = [
  "security",
  "other",
] as const satisfies readonly StackGroupId[]

/** Dense 10-col spans — fits one viewport on md+. */
export const stackGroupSpans: Record<StackGroupId, string> = {
  languages: "col-span-10 sm:col-span-5 md:col-span-3",
  databases: "col-span-10 sm:col-span-5 md:col-span-3",
  api: "col-span-10 sm:col-span-5 md:col-span-4",
  frameworks: "col-span-10 md:col-span-6",
  ai: "col-span-10 sm:col-span-5 md:col-span-4",
  security: "col-span-10 sm:col-span-5 md:col-span-5",
  other: "col-span-10 sm:col-span-5 md:col-span-5",
}

export function getSkillGroupsById() {
  return Object.fromEntries(
    profileContent.skills.map((group) => [group.id, group])
  ) as Record<StackGroupId, (typeof profileContent.skills)[number]>
}
