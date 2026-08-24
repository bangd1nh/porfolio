"use client"

import { FileDown, GitBranch, Mail, Phone } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { BuildBlocksStage } from "@/components/molecules/build-blocks-stage"
import { TransitionLink } from "@/components/molecules/transition-link"
import { Button } from "@/components/ui/button"
import { buildBlocks } from "@/data/build-blocks"
import { contactLinks } from "@/data/contact"
import { resumeLinks } from "@/data/resume"

/** Lightweight capability selection that carries context into the email CTA. */
export function ContactInteraction() {
  const t = useTranslations("contact")
  const blockT = useTranslations("contact.blocks")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedBlock = buildBlocks.find((block) => block.id === selectedId)
  const selectedLabel = selectedBlock
    ? blockT(selectedBlock.labelKey)
    : null
  const conversationLabel = selectedLabel
    ? t("talkAbout", { capability: selectedLabel })
    : t("startConversation")
  const mailSubject = selectedLabel
    ? t("mailSubjectCapability", { capability: selectedLabel })
    : t("mailSubject")

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
        <h2 className="section-title max-w-4xl text-foreground underline decoration-primary decoration-4 underline-offset-8">
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

        <div className="flex w-full max-w-lg flex-wrap items-center justify-center gap-2 sm:max-w-none sm:gap-3">
          <Button
            size="lg"
            className="min-h-11 max-w-full rounded-none px-5"
            nativeButton={false}
            render={
              <a
                href={`mailto:${contactLinks.email}?subject=${encodeURIComponent(mailSubject)}`}
              />
            }
          >
            <Mail data-icon="inline-start" aria-hidden />
            <span className="truncate">{conversationLabel}</span>
          </Button>
          <Button
            variant="outline"
            className="min-h-11 rounded-none"
            nativeButton={false}
            render={<a href={`tel:${contactLinks.phone}`} />}
          >
            <Phone data-icon="inline-start" aria-hidden />
            {t("phone")}
          </Button>
          <Button
            variant="outline"
            className="min-h-11 rounded-none"
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
            variant="outline"
            className="min-h-11 rounded-none"
            nativeButton={false}
            render={<TransitionLink href={resumeLinks.pagePath} />}
          >
            <FileDown data-icon="inline-start" aria-hidden />
            {t("resume")}
          </Button>
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
