import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'
import { AboutSection } from './sections/AboutSection'
import { ActivitiesSection } from './sections/ActivitiesSection'
import { AffiliationCta } from './sections/AffiliationCta'
import { BusinessesSection } from './sections/BusinessesSection'
import { ContactSection } from './sections/ContactSection'
import { DistrictsSection } from './sections/DistrictsSection'
import { Hero } from './sections/Hero'
import { MissionVisionSection } from './sections/MissionVisionSection'
import { NewsSection } from './sections/NewsSection'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AboutSection />
        <MissionVisionSection />
        <DistrictsSection />
        <ActivitiesSection />
        <BusinessesSection />
        <NewsSection />
        <AffiliationCta />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
