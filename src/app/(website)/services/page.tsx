'use client'

// import { HeroSection } from '../../components/services/HeroSection'
import {HeroSection} from "../../../components/website/services/HeroSection"
import { QuickStats } from '../../../components/website/services/QuickStats'
import { CategorySection } from '../../../components/website/services/CategorySection'
import { CTASection } from '../../../components/website/services/CTASection'
import { servicesData } from "@/app/data/servicesData"
import Navbar from "@/components/website/Navbar"
import Footer from "@/components/website/Footer"

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <Navbar />
      <HeroSection />
      <QuickStats />

      {servicesData.categories.map((category, index) => (
        <CategorySection key={category.id} category={category} index={index} />
      ))}

      <CTASection />
      <Footer />
    </div>
  )
}