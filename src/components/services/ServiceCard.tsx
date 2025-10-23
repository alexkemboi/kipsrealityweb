"use client"
import { useState } from 'react'
import { ArrowUpRight, Zap, CheckCircle2, Sparkles } from 'lucide-react'
import * as Icons from 'lucide-react'
import { theme } from '../../app/data/servicesData'

interface ServiceCardProps {
  service: any
  categoryColor: string
}

export const ServiceCard = ({ service, categoryColor }: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = (Icons as any)[service.icon]

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      {/* Animated Glow Effect */}
      <div
        className="absolute -inset-0.5 rounded-3xl opacity-0 blur-2xl transition-all duration-700"
        style={{
          background: `linear-gradient(135deg, ${categoryColor}, ${theme.accent})`,
          opacity: isHovered ? 0.6 : 0,
          transform: isHovered ? 'scale(1.05)' : 'scale(0.95)'
        }}
      />

      <div
        className="relative h-full rounded-2xl border-2 transition-all duration-500 overflow-hidden"
        style={{
          background: theme.white,
          borderColor: isHovered ? categoryColor : '#E5E7EB',
          transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
          boxShadow: isHovered
            ? `0 25px 60px -12px ${categoryColor}40, 0 0 0 1px ${categoryColor}20`
            : '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}
      >
        {/* Top Accent Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, ${categoryColor}, ${theme.accent})`,
            transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left'
          }}
        />

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${categoryColor} 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            opacity: isHovered ? 0.03 : 0
          }}
        />

        <div className="relative p-6 sm:p-8">
          {/* Icon & Arrow */}
          <div className="flex items-start justify-between mb-6">
            <div className="relative">
              <div
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden"
                style={{
                  background: isHovered
                    ? `linear-gradient(135deg, ${categoryColor}, ${theme.accent})`
                    : `${categoryColor}10`,
                  transform: isHovered ? 'rotate(-5deg) scale(1.1)' : 'rotate(0) scale(1)',
                  boxShadow: isHovered ? `0 8px 24px ${categoryColor}30` : 'none'
                }}
              >
                {/* Shine effect */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: 'translateX(-100%)',
                    animation: isHovered ? 'shine 1.5s ease-in-out infinite' : 'none'
                  }}
                />
                <Icon
                  size={28}
                  style={{ color: isHovered ? theme.white : categoryColor }}
                  strokeWidth={2.5}
                  className="relative z-10"
                />
              </div>

              {/* Floating sparkle */}
              {isHovered && (
                <Sparkles
                  size={16}
                  className="absolute -top-2 -right-2 animate-pulse"
                  style={{ color: categoryColor }}
                />
              )}
            </div>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500"
              style={{
                background: isHovered ? `${categoryColor}10` : 'transparent',
                transform: isHovered ? 'rotate(45deg) scale(1)' : 'rotate(0deg) scale(0.8)',
                opacity: isHovered ? 1 : 0
              }}
            >
              <ArrowUpRight
                size={20}
                strokeWidth={3}
                style={{
                  color: categoryColor,
                  transform: 'rotate(-45deg)'
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3
              className="text-xl sm:text-2xl font-bold mb-3 leading-tight transition-colors duration-300"
              style={{ color: isHovered ? categoryColor : theme.primary }}
            >
              {service.name}
            </h3>

            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: '#64748B' }}
            >
              {service.description}
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-6">
            {service.features.map((feature: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 transition-all duration-300"
                style={{
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                  transitionDelay: `${idx * 50}ms`
                }}
              >
                <CheckCircle2
                  size={18}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: categoryColor }}
                  strokeWidth={2.5}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: '#475569' }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Impact Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-500"
            style={{
              background: isHovered
                ? `linear-gradient(135deg, ${categoryColor}, ${theme.accent})`
                : `${categoryColor}08`,
              color: isHovered ? theme.white : categoryColor,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isHovered ? `0 4px 12px ${categoryColor}30` : 'none'
            }}
          >
            <Zap
              size={16}
              fill={isHovered ? theme.white : 'none'}
              strokeWidth={2.5}
            />
            <span>{service.impact}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  )
}