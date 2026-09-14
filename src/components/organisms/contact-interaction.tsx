"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  FileDown,
  GitBranch,
  Mail,
  Phone,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { BuildBlocksStage } from "@/components/molecules/build-blocks-stage"
import { TransitionLink } from "@/components/molecules/transition-link"
import { Button } from "@/components/ui/button"
import { buildBlocks } from "@/data/build-blocks"
import { contactLinks } from "@/data/contact"
import {
  PROJECT_SELECTION_EVENT,
  projectsContent,
  type ProjectId,
} from "@/data/projects"
import { resumeLinks } from "@/data/resume"
import { prefersReducedMotion, scrollToHashSection } from "@/lib/scroll-to-section"

/** Lightweight capability selection that carries context into the email CTA. */
export function ContactInteraction() {
  const t = useTranslations("contact")
  const blockT = useTranslations("contact.blocks")
  const projectT = useTranslations("projects")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedBlock = buildBlocks.find((block) => block.id === selectedId)
  const selectedLabel = selectedBlock
    ? blockT(selectedBlock.labelKey)
    : null
  const relatedProjects = selectedBlock
    ? selectedBlock.projectIds
        .map((projectId) =>
          projectsContent.find((project) => project.id === projectId)
        )
        .filter((project) => project !== undefined)
        .slice(0, 3)
    : []
  const conversationLabel = selectedLabel
    ? t("talkAbout", { capability: selectedLabel })
    : t("startConversation")
  const mailSubject = selectedLabel
    ? t("mailSubjectCapability", { capability: selectedLabel })
    : t("mailSubject")

  const openProject = (projectId: ProjectId) => {
    window.dispatchEvent(
      new CustomEvent(PROJECT_SELECTION_EVENT, { detail: { projectId } })
    )
    window.requestAnimationFrame(() => {
      scrollToHashSection("#projects", !prefersReducedMotion())
    })
  }

  return (
    <div className="col-span-10 grid min-h-0 content-stretch gap-y-3 lg:h-full lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-4">
      <header className="grid justify-items-center gap-3 px-2 text-center">
        <p className="system-label text-foreground">
          <span
            className="mr-2 inline-block size-1.5 bg-primary align-middle"
            aria-hidden
          />
          {t("eyebrow")}
        </p>
        <h2 className="section-title max-w-[14ch] text-balance leading-[1.15] text-foreground underline decoration-primary decoration-[3px] underline-offset-[0.16em] sm:max-w-4xl sm:leading-none sm:decoration-4 sm:underline-offset-8">
          {t("title")}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("description")}
        </p>
        <p
          className="min-h-5 font-mono text-[11px] font-semibold tracking-[0.08em] text-primary uppercase"
          aria-live="polite"
        >
          {selectedLabel
            ? t("selectedCapability", { capability: selectedLabel })
            : "\u00a0"}
        </p>

        <div
          className="grid w-full max-w-2xl gap-1.5 text-left"
          aria-hidden={relatedProjects.length === 0}
          aria-live="polite"
        >
          <p
            className={`text-center font-mono text-[9px] font-semibold tracking-widest text-muted-foreground uppercase ${relatedProjects.length === 0 ? "invisible" : ""}`}
          >
            {t("relatedWork")}
          </p>
          <div className="flex min-h-[3.5625rem] gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {relatedProjects.map((project) => {
              const title = projectT(`items.${project.id}.title`)
              return (
                <button
                  key={project.id}
                  type="button"
                  aria-label={t("openProject", { project: title })}
                  className="group min-h-11 min-w-40 flex-1 cursor-pointer border border-border bg-muted/40 dark:bg-background px-3 py-2 text-left transition-[background-color,border-color] duration-150 hover:border-primary hover:bg-primary/10 dark:hover:bg-primary dark:hover:text-primary-foreground motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => openProject(project.id)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-heading text-sm font-semibold tracking-tight text-foreground">
                      {title}
                    </span>
                    <ArrowDownRight
                      className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[8px] tracking-[0.08em] text-muted-foreground uppercase">
                    {projectT(`items.${project.id}.descriptor`)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid w-full justify-items-center gap-1.5">
          <Button
            size="lg"
            className="min-h-11 max-w-full rounded-none px-7"
            nativeButton={false}
            render={
              <a
                href={`mailto:${contactLinks.email}?subject=${encodeURIComponent(mailSubject)}`}
              />
            }
          >
            <Mail data-icon="inline-start" aria-hidden />
            <span className="truncate">{conversationLabel}</span>
            <ArrowUpRight data-icon="inline-end" aria-hidden />
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 rounded-none sm:min-h-9"
              nativeButton={false}
              render={<a href={`tel:${contactLinks.phone}`} />}
            >
              <Phone data-icon="inline-start" aria-hidden />
              {t("phone")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 rounded-none sm:min-h-9"
              nativeButton={false}
              render={
                <a
                  href={contactLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <GitBranch data-icon="inline-start" aria-hidden />
              {t("github")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 rounded-none sm:min-h-9"
              nativeButton={false}
              render={<TransitionLink href={resumeLinks.pagePath} />}
            >
              <FileDown data-icon="inline-start" aria-hidden />
              {t("resume")}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 self-stretch">
        <p className="text-center font-mono text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {t("buildCaption")} ·{" "}
          <span className="lg:hidden">{t("buildHintMobile")}</span>
          <span className="hidden lg:inline">{t("buildHintDesktop")}</span>
        </p>
        <BuildBlocksStage
          selectedId={selectedId}
          onSelectedIdChange={setSelectedId}
          className="h-full min-h-32 sm:min-h-40 lg:min-h-0"
        />
      </div>
    </div>
  )
}
