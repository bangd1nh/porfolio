import { ContactInteraction } from "@/components/organisms/contact-interaction"
import { SiteFooter } from "@/components/organisms/site-footer"
import { VIEWPORT_SECTION } from "@/data/site"

/**
 * Contact CTA + embedded footer — free scroll on phone/tablet; viewport on desktop.
 */
export function ContactCtaSection() {
  return (
    <section
      id="contact"
      className={`page-section relative isolate box-border gap-y-3 border-t border-border bg-transparent pt-8 pb-28 lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-y-2 lg:pb-8 ${VIEWPORT_SECTION}`}
    >
      <ContactInteraction />

      <SiteFooter embedded />
    </section>
  )
}
