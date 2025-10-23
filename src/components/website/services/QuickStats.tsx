import { theme, servicesData } from '@/app/data/servicesData'

export const QuickStats = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {servicesData.stats.map((stat, idx) => (
          <div
            key={idx}
            className="text-center p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{
              background: theme.white,
              borderColor: theme.accent
            }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2" style={{ color: theme.secondary }}>
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: '#64748B' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
