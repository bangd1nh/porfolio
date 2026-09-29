import { ProjectCard, type ProjectCardVariant } from "@/components/molecules/project-card"
import { SectionHeading } from "@/components/molecules/section-heading"
import { FEATURED_PROJECT_ID, type ProjectId } from "@/data/projects"
import { cn } from "@/lib/utils"

export type ProjectsGridItem = {
  id: ProjectId
  icon: string
  title: string
  period: string
  outcome: string
  featured: boolean
}

const BENTO_CELL: Record<ProjectId, string> = {
  uctalent:
    "col-span-10 min-h-0 lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1",
  guscent:
    "col-span-10 min-h-0 sm:col-span-5 lg:col-span-4 lg:col-start-7 lg:row-start-1",
  unchainlabs:
    "col-span-10 min-h-0 sm:col-span-5 lg:col-span-4 lg:col-start-7 lg:row-start-2",
  matchtutors:
    "col-span-10 min-h-0 lg:col-span-10 lg:col-start-1 lg:row-start-3",
}

function cardVariant(id: ProjectId): ProjectCardVariant {
  if (id === FEATURED_PROJECT_ID) return "featured"
  if (id === "matchtutors") return "wide"
  return "compact"
}

type ProjectsGridProps = {
  projects: readonly ProjectsGridItem[]
  sectionIndex: number
  sectionLabel: string
  sectionTitle: string
  sectionDescription: string
  viewDetailsLabel: string
  featuredProjectBadge: string
}

/** Selected work — bento grid with one featured flagship project. */
export function ProjectsGrid({
  projects,
  sectionIndex,
  sectionLabel,
  sectionTitle,
  sectionDescription,
  viewDetailsLabel,
  featuredProjectBadge,
}: ProjectsGridProps) {
  return (
    <div
      data-projects-grid
      className="col-span-10 grid h-full min-h-0 grid-cols-subgrid gap-y-6 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-5"
    >
      <SectionHeading
        index={sectionIndex}
        label={sectionLabel}
        title={sectionTitle}
        description={sectionDescription}
        className="shrink-0 gap-y-2 lg:gap-y-1.5"
        titleClassName="lg:text-5xl [@media(min-width:1024px)_and_(max-height:50rem)]:text-3xl"
        descriptionClassName="max-w-3xl lg:text-sm [@media(min-width:1024px)_and_(max-height:50rem)]:line-clamp-2"
      />

      <ul
        data-reveal-group="clip"
        data-reveal-stagger="0.1"
        className={cn(
          "col-span-10 grid min-h-0 grid-cols-subgrid gap-4 sm:grid-cols-10 sm:gap-5",
          "lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.75fr)] lg:gap-x-[var(--page-col-gap)] lg:gap-y-4"
        )}
      >
        {projects.map((project, index) => {
          const variant = cardVariant(project.id)
          return (
            <li key={project.id} className={BENTO_CELL[project.id]}>
              <ProjectCard
                id={project.id}
                index={index + 1}
                icon={project.icon}
                title={project.title}
                period={project.period}
                outcome={project.outcome}
                viewDetailsLabel={viewDetailsLabel}
                variant={variant}
                featuredBadgeLabel={
                  project.featured ? featuredProjectBadge : undefined
                }
                className="h-full"
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
