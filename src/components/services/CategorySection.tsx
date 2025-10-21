import * as Icons from 'lucide-react'
import { ServiceCard } from './ServiceCard'
import { theme } from '../../app/data/servicesData'

interface CategorySectionProps {
  category: any
  index: number
}

export const CategorySection = ({ category, index }: CategorySectionProps) => {
  const Icon = (Icons as any)[category.icon]
  const isEven = index % 2 === 0

  return (
    <div
      className="relative py-16 sm:py-20 md:py-24"
      style={{ background: isEven ? theme.white : '#F8FBFF' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Category Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-12 sm:mb-16">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: theme.gradients.accent }}
          >
            <Icon size={32} className="sm:w-9 sm:h-9" style={{ color: theme.white }} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2" style={{ color: theme.primary }}>
              {category.name}
            </h2>
            <p className="text-base sm:text-lg md:text-xl font-medium" style={{ color: theme.accent }}>
              {category.tagline}
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {category.services.map((service: any, idx: number) => (
            <ServiceCard
              key={idx}
              service={service}
              categoryColor={category.color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
