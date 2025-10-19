import { Sparkles } from 'lucide-react'
import { theme, servicesData } from '../../data/servicesData'

export const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between"
      style={{
        background: '#021526',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Abstract shapes (floating background elements) */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl"
          style={{
            background: theme.accent,
            top: '-10%',
            right: '-5%',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-56 h-56 rounded-full blur-3xl"
          style={{
            background: theme.secondary,
            bottom: '-15%',
            left: '-5%',
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Left Section – Text content */}
      <div className="relative z-10 w-full md:w-1/2 px-6 md:px-16 py-24">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{
            background: `${theme.white}15`,
            border: `1px solid ${theme.white}20`,
          }}
        >
          <Sparkles size={16} style={{ color: theme.accent }} />
          <span className="text-sm font-semibold" style={{ color: theme.white }}>
            {servicesData.hero.badge}
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6">
          <span style={{ color: theme.white }}>{servicesData.hero.title}</span>{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${theme.accent}, ${theme.white}, ${theme.accent})`,
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            {servicesData.hero.highlight}
          </span>
          <br />
          <span style={{ color: theme.accent }}>{servicesData.hero.subtitle}</span>
        </h1>

        <p
          className="text-lg max-w-md mb-8"
          style={{ color: `${theme.white}B3` }}
        >
          {servicesData.hero.description}
        </p>

        \

      </div>

      {/* Right Section – Image cards */}
     <div className="relative w-full md:w-1/2 px-6 md:px-16 py-10 md:py-0">
        <div className="relative">
          <img
            src ="https://willstonehomes.ke/wp-content/uploads/2025/02/exterior-01.png"
            alt="Modern home"
            className="rounded-3xl shadow-2xl w-full object-cover"
          />
          <div
            className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg p-4 w-64"
            style={{ color: theme.secondary }}
          >
            <h3 className="font-semibold text-lg">Stylish home near the city</h3>
            <p className="text-sm text-gray-500">2 bed • 1 bath • from $120</p>
          </div>
        </div>
        
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -40px) scale(1.05);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </section>
  )
}
