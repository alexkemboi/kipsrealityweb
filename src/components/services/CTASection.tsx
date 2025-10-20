import { ChevronRight } from 'lucide-react'
import { theme } from '../../app/data/servicesData'

export const CTASection = () => {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: theme.gradients.hero }}
    >
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight" style={{ color: theme.white }}>
          Ready to Experience
          <br />
          <span style={{ color: theme.accent }}>All These Services?</span>
        </h2>

        <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 px-4" style={{ color: `${theme.white}70` }}>
          Start your free trial and unlock the complete service suite today
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <button
            className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
            style={{
              background: theme.accent,
              color: theme.primary,
              boxShadow: `0 10px 40px ${theme.accent}40`
            }}
          >
            <span>Start Free Trial</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}