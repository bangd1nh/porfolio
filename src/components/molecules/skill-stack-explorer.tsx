import { SkillIcon } from "@/components/atoms/skill-icon"
import { cn } from "@/lib/utils"

type SkillStackExplorerProps = {
  primary: readonly string[]
  productionExperience: readonly string[]
  aiSystems: readonly string[]
  additional: readonly string[]
  labels: {
    primary: string
    productionExperience: string
    aiSystems: string
    additional: string
    primaryStatus: string
    productionStatus: string
    aiStatus: string
    additionalStatus: string
  }
}

function FeaturedSkillColumn({
  index,
  title,
  status,
  items,
  className,
}: {
  index: string
  title: string
  status: string
  items: readonly string[]
  className?: string
}) {
  return (
    <article className={cn("grid content-start gap-5", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1.5">
          <p className="system-label">{index} / {title}</p>
          <p className="font-mono text-[10px] tracking-[0.1em] text-primary uppercase">
            {status}
          </p>
        </div>
      </header>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item} className="flex min-w-0 items-center gap-2 text-sm font-semibold sm:text-base">
            <SkillIcon name={item} className="size-4 shrink-0 text-muted-foreground" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export function SkillStackExplorer({
  primary,
  productionExperience,
  aiSystems,
  additional,
  labels,
}: SkillStackExplorerProps) {
  return (
    <div className="grid border-y border-border">
      <div className="grid gap-7 py-6 lg:grid-cols-2 lg:gap-0 lg:py-8">
        <FeaturedSkillColumn
          index="01"
          title={labels.primary}
          status={labels.primaryStatus}
          items={primary}
          className="lg:pr-8"
        />
        <FeaturedSkillColumn
          index="02"
          title={labels.productionExperience}
          status={labels.productionStatus}
          items={productionExperience}
          className="border-t border-border pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        />
      </div>

      <div className="grid border-t border-border lg:grid-cols-2">
        <FeaturedSkillColumn
          index="03"
          title={labels.aiSystems}
          status={labels.aiStatus}
          items={aiSystems}
          className="py-6 lg:pr-8"
        />
        <FeaturedSkillColumn
          index="04"
          title={labels.additional}
          status={labels.additionalStatus}
          items={additional}
          className="border-t border-border py-6 lg:border-t-0 lg:border-l lg:pl-8"
        />
      </div>
    </div>
  )
}
