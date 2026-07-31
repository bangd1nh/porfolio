import { DotSpotlightBackground } from "@/components/atoms/dot-spotlight-background"
import { PageGrid } from "@/components/atoms/page-grid"
import { ContactCtaSection } from "@/components/organisms/contact-cta-section"
import { FeaturedStackSection } from "@/components/organisms/featured-stack-section"
import { HeroSection } from "@/components/organisms/hero-section"
import { ProfileDetailSection } from "@/components/organisms/profile-detail-section"
import { ProjectsSection } from "@/components/organisms/projects-section"
import { SectionPager } from "@/components/organisms/section-pager"
import { SiteDock } from "@/components/organisms/site-dock"
import { routing, type Locale } from "@/i18n/routing"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: PageProps) {
  const { locale: localeParam } = await params

  if (!hasLocale(routing.locales, localeParam)) {
    notFound()
  }

  setRequestLocale(localeParam as Locale)

  return (
    <div className="relative min-h-full">
      <DotSpotlightBackground />
      <SiteDock />
      <PageGrid className="relative z-10">
        <main className="contents">
          <SectionPager>
            <HeroSection />
            <ProfileDetailSection />
            <ProjectsSection />
            <FeaturedStackSection />
            <ContactCtaSection />
          </SectionPager>
        </main>
      </PageGrid>
    </div>
  )
}
