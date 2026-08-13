import { FileDown, GitBranch, Mail, Phone } from "lucide-react"

import { BuildBlocksStage } from "@/components/molecules/build-blocks-stage"
import { TransitionLink } from "@/components/molecules/transition-link"
import { SiteFooter } from "@/components/organisms/site-footer"
import { Button } from "@/components/ui/button"
import { contactLinks } from "@/data/contact"
import { resumeLinks } from "@/data/resume"
import { VIEWPORT_SECTION } from "@/data/site"
import { getTranslations } from "next-intl/server"

/**
 * Contact CTA + embedded footer — free scroll on phone/tablet; viewport on desktop.
 */
export async function ContactCtaSection() {
  const t = await getTranslations("contact")

  return (
    <section
      id="contact"
      className={`page-section relative isolate box-border gap-y-3 border-t border-border bg-transparent pt-8 pb-8 lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-y-2 lg:pb-8 ${VIEWPORT_SECTION}`}
    >
      <div className="col-span-10 grid min-h-0 content-stretch gap-y-3 lg:h-full lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-4">
        <header className="grid justify-items-center gap-3 px-2 text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-foreground uppercase sm:text-xs">
            <span
              className="mr-2 inline-block size-1.5 bg-primary align-middle"
              aria-hidden
            />
            {t("eyebrow")}
          </p>
          <h2 className="font-heading max-w-4xl text-2xl leading-tight tracking-tight text-foreground underline decoration-primary decoration-4 underline-offset-8 sm:text-3xl md:text-5xl lg:text-6xl">
            {t("title")}
          </h2>

          <div className="mt-1 flex w-full max-w-lg flex-wrap items-center justify-center gap-2 sm:max-w-none sm:gap-3">
            <Button
              className="min-h-10 rounded-none"
              nativeButton={false}
              render={<a href={`mailto:${contactLinks.email}`} />}
            >
              <Mail className="size-4" aria-hidden />
              {t("email")}
            </Button>
            <Button
              variant="outline"
              className="min-h-10 rounded-none"
              nativeButton={false}
              render={<a href={`tel:${contactLinks.phone}`} />}
            >
              <Phone className="size-4" aria-hidden />
              {t("phone")}
            </Button>
            <Button
              variant="outline"
              className="min-h-10 rounded-none"
              nativeButton={false}
              render={
                <a
                  href={contactLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <GitBranch className="size-4" aria-hidden />
              {t("github")}
            </Button>
            <Button
              variant="outline"
              className="min-h-10 rounded-none"
              nativeButton={false}
              render={<TransitionLink href={resumeLinks.pagePath} />}
            >
              <FileDown className="size-4" aria-hidden />
              {t("resume")}
            </Button>
          </div>
        </header>

        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 self-stretch">
          <p className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("buildCaption")}
          </p>
          <BuildBlocksStage className="h-full min-h-32 sm:min-h-40 lg:min-h-0" />
        </div>
      </div>

      <SiteFooter embedded />
    </section>
  )
}
