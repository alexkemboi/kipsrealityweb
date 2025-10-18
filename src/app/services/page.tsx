'use client'

import { useState } from 'react'
import { Home, FileText, Wrench, Users, Search, CreditCard, CheckSquare, RefreshCw, Bell, DollarSign, Droplet, BarChart3, LucideIcon, Sparkles, ArrowRight, TrendingUp } from 'lucide-react'

interface Service {
  id: number
  icon: LucideIcon
  title: string
  description: string
}

interface ServiceCardProps {
  service: Service
  index: number
}

export default function ServicesPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const coreServices: Service[] = [
    {
      id: 1,
      icon: Home,
      title: 'Property Listing',
      description: 'Showcase your properties with detailed listings and attract potential tenants.'
    },
    {
      id: 2,
      icon: FileText,
      title: 'Lease Management',
      description: 'Manage leases efficiently, track renewals, and ensure compliance.'
    },
    {
      id: 3,
      icon: Wrench,
      title: 'Maintenance Tracking',
      description: 'Monitor and manage maintenance requests, ensuring timely resolutions.'
    },
    {
      id: 4,
      icon: Users,
      title: 'Occupancy Monitoring',
      description: 'Keep track of property occupancy rates and identify vacancies.'
    },
    {
      id: 5,
      icon: Search,
      title: 'Tenant Background Checks',
      description: 'Conduct thorough background checks to ensure tenant reliability.'
    },
    {
      id: 6,
      icon: CreditCard,
      title: 'Credit Scoring',
      description: 'Assess tenant creditworthiness with integrated credit scoring.'
    }
  ]

  const automationServices: Service[] = [
    {
      id: 7,
      icon: CheckSquare,
      title: 'Verification Workflows',
      description: 'Streamline tenant verification processes for faster approvals.'
    },
    {
      id: 8,
      icon: RefreshCw,
      title: 'Automated Invoicing',
      description: 'Generate invoices automatically, saving time and reducing errors.'
    },
    {
      id: 9,
      icon: Bell,
      title: 'Rent Reminders',
      description: 'Send automated reminders to tenants for timely rent payments.'
    }
  ]

  const financialServices: Service[] = [
    {
      id: 10,
      icon: DollarSign,
      title: 'Real-Time Reconciliation',
      description: 'Reconcile payments in real-time for accurate financial tracking.'
    },
    {
      id: 11,
      icon: Droplet,
      title: 'Utility Billing',
      description: 'Generate bills for utilities, including water, electricity, and waste.'
    },
    {
      id: 12,
      icon: BarChart3,
      title: 'Customized Reports',
      description: 'Create customized reports to analyze property performance and trends.'
    }
  ]

  const ServiceCard = ({ service, index }: ServiceCardProps) => {
    const Icon = service.icon
    const isHovered = hoveredCard === service.id

    return (
      <div
        onMouseEnter={() => setHoveredCard(service.id)}
        onMouseLeave={() => setHoveredCard(null)}
        className="group relative h-full"
      >
        {/* Glow effect on hover */}
        <div 
          className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700`}
          style={{
            background: 'linear-gradient(135deg, #113892, #1e4fb8, #113892)',
            backgroundSize: '200% 200%',
            animation: isHovered ? 'gradient-shift 3s ease infinite' : 'none'
          }}
        />
        
        <div 
          className={`relative h-full rounded-2xl p-8 transition-all duration-500 overflow-hidden ${
            isHovered 
              ? 'transform -translate-y-2 shadow-2xl' 
              : 'shadow-lg'
          }`}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            border: isHovered ? '2px solid #113892' : '2px solid rgba(17, 56, 146, 0.1)'
          }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #113892 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />

          {/* Icon container with animated background */}
          <div className="relative mb-6">
            <div 
              className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isHovered ? 'scale-110 rotate-3' : ''
              }`}
              style={{
                background: isHovered 
                  ? 'linear-gradient(135deg, #113892 0%, #1e4fb8 100%)'
                  : 'linear-gradient(135deg, rgba(17, 56, 146, 0.1) 0%, rgba(30, 79, 184, 0.1) 100%)',
                boxShadow: isHovered ? '0 8px 32px rgba(17, 56, 146, 0.3)' : 'none'
              }}
            >
              <Icon 
                size={36} 
                strokeWidth={2.5} 
                className="transition-all duration-500"
                style={{ color: isHovered ? '#ffffff' : '#113892' }}
              />
            </div>
          </div>
          
          <h3 
            className="text-2xl font-bold mb-4 transition-all duration-300"
            style={{ 
              color: '#111827',
              lineHeight: '1.3'
            }}
          >
            {service.title}
          </h3>
          
          <p 
            className="text-base leading-relaxed mb-6" 
            style={{ color: '#4B5563' }}
          >
            {service.description}
          </p>
          
          {/* Learn more link */}
          <div 
            className={`flex items-center gap-2 text-sm font-bold transition-all duration-500 ${
              isHovered ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
            }`}
            style={{ color: '#113892' }}
          >
            <span>Explore feature</span>
            <ArrowRight size={16} className={`transition-transform duration-500 ${isHovered ? 'translate-x-1' : ''}`} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f4ff 50%, #e8f0ff 100%)' }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl animate-float"
          style={{ 
            top: '10%', 
            left: '5%',
            background: 'radial-gradient(circle, rgba(17, 56, 146, 0.15) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl animate-float-delayed"
          style={{ 
            top: '60%', 
            right: '10%',
            background: 'radial-gradient(circle, rgba(17, 24, 39, 0.1) 0%, transparent 70%)',
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl animate-float"
          style={{ 
            bottom: '10%', 
            left: '50%',
            background: 'radial-gradient(circle, rgba(17, 56, 146, 0.12) 0%, transparent 70%)',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 backdrop-blur-sm"
            style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid #113892',
              boxShadow: '0 8px 32px rgba(17, 56, 146, 0.15)'
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: '#113892' }} />
            <span className="text-sm font-bold" style={{ color: '#113892' }}>
              Next-Generation Property Management Platform
            </span>
          </div>
          
          {/* Main headline */}
          <h1 className="text-7xl md:text-8xl font-black mb-8 leading-none">
            <span className="block mb-3" style={{ color: '#111827' }}>
              Smart Services for
            </span>
            <span 
              className="block bg-clip-text text-transparent animate-gradient-text"
              style={{
                background: 'linear-gradient(90deg, #113892 0%, #1e4fb8 25%, #113892 50%, #0d2a6e 75%, #113892 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Modern Property
            </span>
            <span 
              className="block bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(90deg, #113892 0%, #0d2a6e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Management
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-12 font-medium" style={{ color: '#4B5563' }}>
            A comprehensive suite of tools designed to streamline your operations,
            enhance tenant satisfaction, and boost your bottom line.
          </p>

          {/* Stats badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div 
              className="flex items-center gap-3 px-8 py-4 rounded-2xl backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ 
                background: 'linear-gradient(135deg, #113892 0%, #1e4fb8 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: '#ffffff' }} />
              <span className="font-bold text-white">10x Faster Operations</span>
            </div>
            <div 
              className="flex items-center gap-3 px-8 py-4 rounded-2xl backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #113892'
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: '#113892' }} />
              <span className="font-bold" style={{ color: '#113892' }}>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Functionalities Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-black mb-5" style={{ color: '#111827' }}>
            Core <span style={{ color: '#113892' }}>Functionalities</span>
          </h2>
          <div className="w-24 h-2 mx-auto mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #113892 0%, #1e4fb8 100%)' }} />
          <p className="text-xl max-w-2xl mx-auto font-medium" style={{ color: '#4B5563' }}>
            The essential tools to manage your properties with ease and efficiency.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>

      {/* Verification & Automation Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-black mb-5" style={{ color: '#111827' }}>
            Verification & <span style={{ color: '#113892' }}>Automation</span>
          </h2>
          <div className="w-24 h-2 mx-auto mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #113892 0%, #1e4fb8 100%)' }} />
          <p className="text-xl max-w-2xl mx-auto font-medium" style={{ color: '#4B5563' }}>
            Automate your workflows and reduce manual tasks for a more streamlined process.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {automationServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>

      {/* Financial & Utility Management Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 pb-32">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-black mb-5" style={{ color: '#111827' }}>
            Financial & <span style={{ color: '#113892' }}>Utility Management</span>
          </h2>
          <div className="w-24 h-2 mx-auto mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #113892 0%, #1e4fb8 100%)' }} />
          <p className="text-xl max-w-2xl mx-auto font-medium" style={{ color: '#4B5563' }}>
            Manage finances and utilities with precision and clarity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {financialServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-25px, 25px) rotate(-3deg); }
          66% { transform: translate(25px, -25px) rotate(3deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradient-text {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .animate-gradient-text {
          animation: gradient-text 8s linear infinite;
        }
      `}</style>
    </div>
  )
}