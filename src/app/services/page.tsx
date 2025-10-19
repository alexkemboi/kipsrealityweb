'use client'

import { HeroSection } from '../components/services/HeroSection'
import { QuickStats } from '../components/services/QuickStats'
import { CategorySection } from '../components/services/CategorySection'
import { CTASection } from '../components/services/CTASection'
import { servicesData } from '../data/servicesData'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <Navbar/>
      <HeroSection />
      <QuickStats />
      
      {servicesData.categories.map((category, index) => (
        <CategorySection key={category.id} category={category} index={index} />
      ))}
      
      <CTASection />
      <Footer/>
    </div>
  )
}