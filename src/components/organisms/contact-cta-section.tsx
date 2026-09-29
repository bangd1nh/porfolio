import { SectionWatermark } from "@/components/molecules/section-heading"
import { ContactInteraction } from "@/components/organisms/contact-interaction"
import { SiteFooter } from "@/components/organisms/site-footer"
import { VIEWPORT_SECTION } from "@/data/site"

/**
 * Contact brief composer + embedded footer — one snapped screen on desktop.
 */
export function ContactCtaSection() {
  return (
    <section
      id="contact"
      data-screen
      className={`page-section box-border gap-y-6 bg-transparent pt-10 pb-28 sm:pt-12 lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-y-4 lg:pt-12 lg:pb-6 short:gap-y-2 short:pt-5 short:pb-4 ${VIEWPORT_SECTION}`}
    >
      <SectionWatermark index={5} className="right-auto left-[var(--page-pad-inline)]" />
      <ContactInteraction />

      <SiteFooter embedded />
    </section>
  )
}
