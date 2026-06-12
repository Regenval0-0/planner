import SkipLink from './components/SkipLink.tsx'
import Header from './components/Header.tsx'
import Footer from './components/Footer.tsx'
import HeroSection from './sections/HeroSection.tsx'
import BasicInfoSection from './sections/BasicInfoSection.tsx'
import EducationSection from './sections/EducationSection.tsx'
import CareerSection from './sections/CareerSection.tsx'
import EventsSection from './sections/EventsSection.tsx'
import PartnersSection from './sections/PartnersSection.tsx'
import AccessibilitySection from './sections/AccessibilitySection.tsx'
import TeamSection from './sections/TeamSection.tsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <Header />

      <main id="main-content" className="flex-1">
        <HeroSection />
        <BasicInfoSection />
        <EducationSection />
        <CareerSection />
        <EventsSection />
        <PartnersSection />
        <AccessibilitySection />
        <TeamSection />
      </main>

      <Footer />
    </div>
  )
}
