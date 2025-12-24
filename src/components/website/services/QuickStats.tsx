import { theme, servicesData } from '@/app/data/servicesData'

export const QuickStats = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {servicesData.stats.map((stat, idx) => (
          <div
            key={idx}
            className="text-center p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{
              background: theme.white,
              borderColor: theme.accent
            }}
          >
            <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2" style={{ color: theme.secondary }}>
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
