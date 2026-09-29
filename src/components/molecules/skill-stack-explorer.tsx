import { Marquee } from "@/components/atoms/marquee"
import { SkillIcon } from "@/components/atoms/skill-icon"
import { TransitionLink } from "@/components/molecules/transition-link"
import { cn } from "@/lib/utils"

type SkillStackExplorerProps = {
  primary: readonly string[]
  productionExperience: readonly string[]
  /** Ordered as a pipeline — encode → retrieve → augment → generate. */
  aiSystems: readonly string[]
  additional: readonly string[]
  /** Role caption per skill, keyed by skillKey(name). */
  roles: Readonly<Record<string, string>>
  /** Case studies where the AI pipeline shipped. */
  aiProjects: readonly { id: string; title: string }[]
  labels: {
    primary: string
    productionExperience: string
    aiSystems: string
    additional: string
    primaryStatus: string
    productionStatus: string
    aiStatus: string
    additionalStatus: string
    pipelineIn: string
    pipelineOut: string
    usedIn: string
  }
}

const pad = (value: number) => String(value).padStart(2, "0")

/** "Vector Search" → "vectorsearch" — message-key friendly. */
export function skillKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function TileHeader({
  index,
  title,
  status,
  count,
}: {
  index: number
  title: string
  status: string
  count: number
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="grid gap-1.5">
        <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-primary">
          {pad(index)}
        </p>
        <h3 className="font-heading text-lg leading-tight font-semibold tracking-tight sm:text-xl">
          {title}
        </h3>
        <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
          <span className="size-1.5 bg-primary" aria-hidden />
          {status}
        </p>
      </div>
      <p
        className="font-heading text-3xl leading-none font-bold tracking-tighter text-foreground/15 sm:text-4xl"
        aria-hidden
      >
        {pad(count)}
      </p>
    </header>
  )
}

/** Icon-first tool cards that stretch to fill their tile. */
function ToolGrid({
  items,
  roles,
  compact = false,
  className,
}: {
  items: readonly string[]
  roles: SkillStackExplorerProps["roles"]
  /** Single-line cards for narrow tiles. */
  compact?: boolean
  className?: string
}) {
  if (compact) {
    return (
      <ul
        data-reveal-group
        data-reveal-stagger="0.05"
        className={cn("grid auto-rows-[minmax(2.25rem,1fr)] gap-2 short:gap-1.5", className)}
      >
        {items.map((item, index) => (
          <li
            key={item}
            className={cn(
              "tool-card skill-wipe relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 overflow-hidden border-2 border-foreground/15 px-2.5 py-2 short:py-1",
              // Orphan in the last row (5 items → 2+2+1 or 3+2) spans the gap.
              index === items.length - 1 && items.length % 2 === 1 && "col-span-2"
            )}
          >
            <SkillIcon name={item} className="tool-card-ghost" />
            <SkillIcon name={item} className="tool-card-icon size-5 text-muted-foreground short:size-4" />
            <span className="grid min-w-0">
              <span className="truncate text-sm font-semibold">{item}</span>
              {roles[skillKey(item)] ? (
                <span className="tool-card-role truncate font-mono text-[8px] tracking-[0.1em] text-muted-foreground uppercase short:hidden">
                  {roles[skillKey(item)]}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul
      data-reveal-group
      data-reveal-stagger="0.05"
      className={cn("grid min-h-0 gap-2", className)}
    >
      {items.map((item, index) => (
        <li
          key={item}
          className={cn(
            "tool-card skill-wipe relative grid min-h-[6.5rem] content-between gap-3 overflow-hidden border-2 border-foreground/15 p-3 short:min-h-0 short:gap-2 short:p-2.5",
            index === items.length - 1 && items.length % 2 === 1 && "max-sm:col-span-2"
          )}
        >
          <SkillIcon name={item} className="tool-card-ghost" />
          <div className="flex items-start justify-between gap-2">
            <SkillIcon
              name={item}
              className="tool-card-icon size-7 text-muted-foreground short:size-5"
            />
            <span className="font-mono text-[9px] font-bold tracking-[0.12em] opacity-60">
              {pad(index + 1)}
            </span>
          </div>
          <div className="grid gap-0.5">
            <p className="font-heading text-sm leading-tight font-semibold tracking-tight sm:text-base">
              {item}
            </p>
            {roles[skillKey(item)] ? (
              <p className="tool-card-role truncate font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase">
                {roles[skillKey(item)]}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Retrieval pipeline — a packet travels the track while each stage lights up. */
function Pipeline({
  items,
  roles,
  input,
  output,
}: {
  items: readonly string[]
  roles: SkillStackExplorerProps["roles"]
  input: string
  output: string
}) {
  return (
    <div className="grid min-h-0 gap-3 [align-content:safe_center] short:gap-2">
      <div className="flex items-center justify-between font-mono text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 border border-current" aria-hidden />
          {input}
        </span>
        <span className="flex items-center gap-1.5 text-foreground">
          {output}
          <span className="size-1.5 bg-primary" aria-hidden />
        </span>
      </div>
      <ol
        className="pipeline relative grid"
        style={
          {
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            "--pipeline-steps": items.length,
          } as React.CSSProperties
        }
      >
        <span className="pipeline-track" aria-hidden>
          <span className="pipeline-packet" />
        </span>
        {items.map((item, index) => (
          <li
            key={item}
            className="relative grid justify-items-center gap-2 text-center"
            style={{ "--pipeline-i": index } as React.CSSProperties}
          >
            <span className="pipeline-node grid size-11 place-items-center border-2 border-border-brutal bg-card short:size-9">
              <SkillIcon name={item} className="size-4" />
            </span>
            <span className="grid gap-0.5">
              <span className="text-xs leading-tight font-semibold sm:text-sm">{item}</span>
              {roles[skillKey(item)] ? (
                <span className="font-mono text-[8px] tracking-[0.1em] text-muted-foreground uppercase sm:text-[9px] short:hidden">
                  {roles[skillKey(item)]}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Stack screen — flagship column, supporting tiles, and a looping ticker. */
export function SkillStackExplorer({
  primary,
  productionExperience,
  aiSystems,
  additional,
  roles,
  aiProjects,
  labels,
}: SkillStackExplorerProps) {
  const everything = [...primary, ...productionExperience, ...aiSystems, ...additional]

  return (
    <>
      <div
        data-reveal-group="clip"
        data-reveal-stagger="0.12"
        className="col-span-10 grid min-h-0 grid-cols-10 gap-3 sm:gap-4 lg:grid-rows-2"
      >
        <article
          data-spotlight
          className="col-span-10 grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 border-3 border-primary bg-card p-4 shadow-[5px_5px_0_0_var(--foreground)] sm:p-5 lg:col-span-4 lg:row-span-2"
        >
          <TileHeader
            index={1}
            title={labels.primary}
            status={labels.primaryStatus}
            count={primary.length}
          />
          <ol
            data-reveal-group
            data-reveal-stagger="0.06"
            className="grid border-t border-border lg:grid-rows-5"
          >
            {primary.map((item, index) => (
              <li
                key={item}
                className="primary-row skill-wipe grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden border-b border-border px-2 py-3 last:border-b-0"
              >
                <span className="grid size-11 place-items-center border-2 border-foreground/15 short:size-9">
                  <SkillIcon name={item} className="size-5 text-muted-foreground sm:size-6 short:size-5" />
                </span>
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate font-heading text-xl leading-tight font-semibold tracking-tight sm:text-2xl xl:text-3xl short:text-xl">
                    {item}
                  </span>
                  {roles[skillKey(item)] ? (
                    <span className="tool-card-role truncate font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                      {roles[skillKey(item)]}
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-[10px] font-bold tracking-[0.14em]" aria-hidden>
                  {pad(index + 1)}
                </span>
                <SkillIcon name={item} className="primary-row-ghost" />
              </li>
            ))}
          </ol>
        </article>

        <article
          data-spotlight
          className="col-span-10 grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 border-3 border-border-brutal bg-card p-4 shadow-brutal-sm sm:p-5 lg:col-span-6 short:gap-3"
        >
          <TileHeader
            index={2}
            title={labels.productionExperience}
            status={labels.productionStatus}
            count={productionExperience.length}
          />
          <ToolGrid
            items={productionExperience}
            roles={roles}
            className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          />
        </article>

        <article
          data-spotlight
          className="col-span-10 grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 border-3 border-border-brutal bg-card p-4 shadow-brutal-sm sm:p-5 lg:col-span-3 short:gap-2"
        >
          <TileHeader
            index={3}
            title={labels.aiSystems}
            status={labels.aiStatus}
            count={aiSystems.length}
          />
          <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3">
            <Pipeline
              items={aiSystems}
              roles={roles}
              input={labels.pipelineIn}
              output={labels.pipelineOut}
            />
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border pt-3 font-mono short:hidden text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {labels.usedIn}
              <span className="text-primary" aria-hidden>
                →
              </span>
              {aiProjects.map((project) => (
                <TransitionLink
                  key={project.id}
                  href={`/projects/${project.id}`}
                  prefetch={false}
                  className="border border-foreground/20 px-1.5 py-0.5 text-foreground normal-case tracking-normal transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {project.title}
                </TransitionLink>
              ))}
            </p>
          </div>
        </article>

        <article
          data-spotlight
          className="col-span-10 grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4 border-3 border-border-brutal bg-card p-4 shadow-brutal-sm sm:p-5 lg:col-span-3 short:gap-3"
        >
          <TileHeader
            index={4}
            title={labels.additional}
            status={labels.additionalStatus}
            count={additional.length}
          />
          <ToolGrid
            items={additional}
            roles={roles}
            compact
            className="grid-cols-2 sm:grid-cols-3 short:grid-cols-2"
          />
        </article>
      </div>

      <div className="col-span-10 border-y border-border">
        <div data-reveal="up" className="py-4 sm:py-5 short:py-3">
          <Marquee duration={45}>
            {everything.map((item) => (
              <span key={item} className="flex items-center gap-[var(--marquee-gap)]">
                <span className="stack-ticker-item">{item}</span>
                <span className="size-2.5 rotate-45 bg-primary" aria-hidden />
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </>
  )
}
