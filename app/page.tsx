import { Header, Footer } from '../components/layout'
import HeroSlider from '../components/home/HeroSlider'
import HeroSection from '../components/home/HeroSection'
import ServicesSection from '../components/home/ServicesSection'
import FAQ from '../components/home/FAQ'
import CashbackBanner from '../components/home/CashbackBanner'
import HowItWorks from '../components/home/HowItWorks'
import WhyChooseUs from '../components/home/WhyChooseUs'
import ContactSupport from '../components/home/ContactSupport'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="flex-1">
        {/* Hero Slider - Full Width */}
        <HeroSlider />
        
        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section with gradient background */}
          <div className="relative">
            <HeroSection />
          </div>

          {/* Services Section - Key section */}
          <ServicesSection />

          {/* Additional Sections */}
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            <FAQ />
            <CashbackBanner />
            <HowItWorks />
            <WhyChooseUs />
            <ContactSupport />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
