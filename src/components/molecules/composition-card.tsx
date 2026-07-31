"use client"

import Image from "next/image"
import { useRef } from "react"
import { useLocale, useTranslations } from "next-intl"

import { BentoStatCard } from "@/components/atoms/bento-stat-card"
import { DraggableSticker } from "@/components/atoms/draggable-sticker"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { bentoContent, bentoIcons, getStackTeaserGroups } from "@/data/bento"
import { githubAvatarFallback } from "@/lib/github-stats"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn, formatCompact } from "@/lib/utils"

type GithubStatsView = {
  repos: number
  stars: number
  openPullRequests?: number
  contributions: number
  avatarUrl?: string
}

type CompositionCardProps = {
  className?: string
  /** Live stats from GitHub GraphQL; falls back to `bentoContent.github`. */
  githubStats?: GithubStatsView | null
}

type LocaleKey = "en" | "vi"

function tiltFromId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 3)) % 7
  }
  return -3 + hash
}

/**
 * Hero bento collage — condensed profile teasers; full detail in `#profile`.
 */
export function CompositionCard({
  className,
  githubStats,
}: CompositionCardProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const isMdUp = useMediaQuery("(min-width: 768px)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const locale = useLocale() as LocaleKey
  const t = useTranslations("hero")
  const stickerRotate = (id: string) =>
    isMdUp && !reducedMotion ? tiltFromId(id) : 0
  const { avatar, stack, experience, github, location, education, ai } =
    bentoContent
  const LocationIcon = bentoIcons.location
  const GithubIcon = bentoIcons.github
  const EducationIcon = bentoIcons.education
  const AiIcon = bentoIcons.ai

  const stackTeaserGroups = getStackTeaserGroups(
    stack.groups,
    stack.visiblePerGroup
  )
  const visibleAi = ai.items.slice(0, ai.visibleCount)
  const aiHasMore = ai.items.length > ai.visibleCount

  const repos = githubStats?.repos ?? github.repos
  const stars = githubStats?.stars ?? github.stars
  const openPullRequests =
    githubStats?.openPullRequests ?? github.openPullRequests
  const contributions = githubStats?.contributions ?? github.contributions
  const avatarSrc =
    githubStats?.avatarUrl ?? avatar.src ?? githubAvatarFallback
  const avatarAlt = t("avatarAlt", { name: t("name") })

  return (
    <aside
      className={cn(
        "composition-card relative aspect-square w-full max-h-full overflow-hidden rounded-none border border-border",
        "bg-secondary dark:bg-card",
        className
      )}
    >
      <div
        ref={constraintsRef}
        className="absolute inset-[4%] min-h-0 min-w-0 overflow-hidden"
      >
        {/* Large yellow — stack preview */}
        <DraggableSticker
          aria-label={stack.title}
          dragConstraints={constraintsRef}
          dragEnabled={isMdUp}
          initialRotate={stickerRotate("stack")}
          style={{
            top: "10%",
            left: "18%",
            width: "28%",
            height: "62%",
            zIndex: 1,
          }}
        >
          <BentoStatCard variant="primary" title={stack.title} className="content-start">
            <div className="mt-1 grid grid-cols-1 gap-2.5">
              {stackTeaserGroups.map((group) => (
                <div key={group.id} className="grid gap-1">
                  <p className="text-[9px] font-bold tracking-widest text-primary-foreground/70 uppercase">
                    {group.label}
                  </p>
                  <ul className="grid grid-cols-1 gap-1">
                    {group.items.map(({ name, icon: Icon }) => (
                      <li
                        key={`${group.id}-${name}`}
                        className="flex min-w-0 items-center gap-2 text-xs font-semibold text-primary-foreground"
                      >
                        <span className="grid size-7 shrink-0 place-items-center rounded-none bg-primary-foreground/15">
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <span className="truncate">{name}</span>
                      </li>
                    ))}
                    {group.hasMore ? (
                      <li>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <a
                                href="#profile"
                                className="inline-flex text-xs font-bold tracking-widest text-primary-foreground/80 underline-offset-2 hover:underline"
                                aria-label={t("collage.moreSkills")}
                              />
                            }
                          >
                            …
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {t("collage.moreSkills")}
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ))}
            </div>
          </BentoStatCard>
        </DraggableSticker>

        {/* Location + education teaser */}
        <DraggableSticker
          aria-label={t("collage.location")}
          dragConstraints={constraintsRef}
          dragEnabled={isMdUp}
          initialRotate={stickerRotate("location")}
          style={{
            top: "38%",
            left: "8%",
            width: "52%",
            height: "28%",
            zIndex: 2,
          }}
        >
          <BentoStatCard
            variant="surface"
            title={t("collage.location")}
            icon={LocationIcon}
            className="content-center"
          >
            <p className="font-heading truncate text-lg font-bold tracking-tight md:text-xl">
              {location.city[locale]}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {location.note[locale]}
            </p>
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
              <EducationIcon className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{education.value[locale]}</span>
            </p>
          </BentoStatCard>
        </DraggableSticker>

        {/* Small yellow — GitHub + AI peek */}
        <DraggableSticker
          aria-label={github.title}
          dragConstraints={constraintsRef}
          dragEnabled={isMdUp}
          initialRotate={stickerRotate("github")}
          style={{
            top: "22%",
            left: "58%",
            width: "28%",
            height: "40%",
            zIndex: 3,
          }}
        >
          <BentoStatCard
            variant="primary"
            title={github.title}
            icon={GithubIcon}
            className="content-start gap-1.5"
          >
            <dl className="grid gap-1 text-primary-foreground">
              <div>
                <dt className="text-[10px] font-medium uppercase opacity-70">
                  {t("collage.repos")}
                </dt>
                <dd className="font-heading text-xl font-bold leading-none">
                  {repos}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-[10px] font-medium uppercase opacity-70">
                    {t("collage.stars")}
                  </dt>
                  <dd className="text-sm font-bold">{formatCompact(stars)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase opacity-70">
                    {t("collage.openPrs")}
                  </dt>
                  <dd className="text-sm font-bold">{openPullRequests}</dd>
                </div>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase opacity-70">
                  {t("collage.contrib")}
                </dt>
                <dd className="text-sm font-bold">
                  {formatCompact(contributions)}
                </dd>
              </div>
            </dl>
            <div className="mt-auto border-t border-primary-foreground/20 pt-1.5">
              <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase opacity-70">
                <AiIcon className="size-3" aria-hidden />
                {ai.title}
              </p>
              <p className="truncate text-[11px] font-semibold text-primary-foreground">
                {visibleAi.join(", ")}
                {aiHasMore ? (
                  <>
                    {" "}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <a
                            href="#profile"
                            className="inline font-bold tracking-widest text-primary-foreground/80 underline-offset-2 hover:underline"
                            aria-label={t("collage.moreAi")}
                          />
                        }
                      >
                        …
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {t("collage.moreAi")}
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : null}
              </p>
            </div>
          </BentoStatCard>
        </DraggableSticker>

        {/* Years */}
        <DraggableSticker
          aria-label={t("collage.experienceLabel")}
          dragConstraints={constraintsRef}
          dragEnabled={isMdUp}
          initialRotate={stickerRotate("experience")}
          style={{
            top: "48%",
            left: "28%",
            width: "30%",
            height: "26%",
            zIndex: 4,
          }}
        >
          <BentoStatCard
            variant="surface"
            value={experience.value}
            description={t("collage.experienceLabel")}
            className="place-content-center text-center"
          />
        </DraggableSticker>

        {/* Avatar */}
        <DraggableSticker
          aria-label={avatarAlt}
          dragConstraints={constraintsRef}
          dragEnabled={isMdUp}
          initialRotate={stickerRotate("avatar")}
          className="overflow-hidden rounded-full ring-4 ring-primary/70"
          style={{
            top: "28%",
            left: "42%",
            width: "36%",
            aspectRatio: "1",
            zIndex: 5,
          }}
        >
          <div className="pointer-events-none relative size-full overflow-hidden rounded-full bg-card">
            <Image
              src={avatarSrc}
              alt={avatarAlt}
              fill
              draggable={false}
              className="pointer-events-none object-cover"
              sizes="(max-width: 768px) 40vw, 20vw"
            />
          </div>
        </DraggableSticker>
      </div>
    </aside>
  )
}
