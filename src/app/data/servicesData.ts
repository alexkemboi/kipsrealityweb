export const theme = {
  primary: '#021526',
  secondary: '#03346E',
  accent: '#6EACDA',
  white: '#FFFFFF',
  gradients: {
    hero: 'linear-gradient(135deg, #021526 0%, #03346E 50%, #021526 100%)',
    card: 'linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)',
    accent: 'linear-gradient(135deg, #03346E 0%, #6EACDA 100%)'
  }
}

export const servicesData = {
  hero: {
    badge: 'Comprehensive Service Suite',
    title: 'Built for Landlords, ',
    highlight: ' Managers,',
    subtitle: 'and Tenants Alike',
    description: 'From tenant screening to financial reporting, our platform delivers every service you need to run a modern, efficient property management business.'
  },
  stats: [
    { value: '12+', label: 'Core Services' },
    { value: '100%', label: 'Automated' },
    { value: '24/7', label: 'Available' },
    { value: '∞', label: 'Scalability' }
  ],
  categories: [
    {
      id: 'tenant',
      icon: 'Users',
      name: 'Tenant Management',
      tagline: 'Find, verify & retain quality tenants',
      color: '#03346E',
      services: [
        {
          icon: 'Search',
          name: 'Advanced Tenant Screening',
          description: 'Multi-layered background verification including criminal records, credit history, employment verification, and rental history.',
          features: ['Identity Verification', 'Credit Score Analysis', 'Employment Checks', 'Eviction History'],
          impact: 'Reduce bad tenant risk by 85%'
        },
        {
          icon: 'CreditCard',
          name: 'Credit & Financial Assessment',
          description: 'Comprehensive financial profiling with income verification, debt-to-income ratios, and payment history analysis.',
          features: ['Real-time Credit Scores', 'Income Verification', 'Bank Statement Analysis', 'Payment Behavior Tracking'],
          impact: 'Make confident decisions in minutes'
        },
        {
          icon: 'CheckSquare',
          name: 'Automated Application Processing',
          description: 'Streamline tenant onboarding with digital applications, instant verification, and automated approval workflows.',
          features: ['Online Applications', 'Document Upload Portal', 'Auto-verification', 'E-signature Integration'],
          impact: 'Process applications 10x faster'
        }
      ]
    },
    {
      id: 'property',
      icon: 'Home',
      name: 'Property Operations',
      tagline: 'Optimize every aspect of property management',
      color: '#6EACDA',
      services: [
        {
          icon: 'Home',
          name: 'Dynamic Property Listings',
          description: 'Create stunning, SEO-optimized listings with virtual tours, floor plans, and instant syndication to major rental platforms.',
          features: ['Multi-platform Publishing', 'Virtual Tours', '3D Floor Plans', 'Automated Updates'],
          impact: 'Fill vacancies 40% faster'
        },
        {
          icon: 'FileText',
          name: 'Digital Lease Management',
          description: 'Complete lease lifecycle management from creation to renewal, with e-signatures, version control, and compliance tracking.',
          features: ['Customizable Templates', 'E-signatures', 'Auto-renewal Reminders', 'Compliance Tracking'],
          impact: 'Zero paperwork, 100% compliant'
        },
        {
          icon: 'Wrench',
          name: 'Smart Maintenance Coordination',
          description: 'Intelligent ticket routing, vendor management, and real-time status tracking for all maintenance requests.',
          features: ['Tenant Request Portal', 'Vendor Dispatch', 'Priority Routing', 'Photo Documentation'],
          impact: 'Resolve issues 3x faster'
        },
        {
          icon: 'TrendingUp',
          name: 'Occupancy Analytics',
          description: 'Real-time vacancy tracking, market analysis, and predictive insights to maximize occupancy and revenue.',
          features: ['Vacancy Dashboard', 'Market Comparisons', 'Revenue Forecasting', 'Seasonal Trends'],
          impact: 'Maximize occupancy rates'
        }
      ]
    },
    {
      id: 'financial',
      icon: 'DollarSign',
      name: 'Financial Management',
      tagline: 'Complete financial control & transparency',
      color: '#021526',
      services: [
        {
          icon: 'DollarSign',
          name: 'Real-Time Financial Reconciliation',
          description: 'Automated payment matching, bank reconciliation, and multi-property financial consolidation with audit trails.',
          features: ['Bank Integration', 'Auto-reconciliation', 'Multi-property View', 'Audit Trails'],
          impact: 'Save 20+ hours per month'
        },
        {
          icon: 'Droplet',
          name: 'Utility Billing & Management',
          description: 'Automated utility bill generation based on meter readings, consumption tracking, and split billing capabilities.',
          features: ['Meter Reading Input', 'Consumption Analytics', 'Split Billing', 'Auto-calculations'],
          impact: 'Eliminate billing errors'
        },
        {
          icon: 'BarChart3',
          name: 'Advanced Reporting Suite',
          description: 'Customizable financial reports, performance dashboards, and predictive analytics for informed decision-making.',
          features: ['Custom Report Builder', 'Performance Metrics', 'Export Options', 'Scheduled Reports'],
          impact: 'Data-driven insights instantly'
        }
      ]
    },
    {
      id: 'automation',
      icon: 'Zap',
      name: 'Automation & Communication',
      tagline: 'Let technology do the heavy lifting',
      color: '#03346E',
      services: [
        {
          icon: 'RefreshCw',
          name: 'Intelligent Invoice Automation',
          description: 'Auto-generate recurring invoices based on lease terms, utilities, and custom charges with zero manual input.',
          features: ['Recurring Invoices', 'Late Fee Auto-calculation', 'Custom Charges', 'Payment Links'],
          impact: 'Never miss a billing cycle'
        },
        {
          icon: 'Bell',
          name: 'Multi-Channel Communication Hub',
          description: 'Automated reminders, notifications, and announcements via SMS, email, and in-app messaging.',
          features: ['Rent Reminders', 'Lease Renewals', 'Maintenance Updates', '2-Way Messaging'],
          impact: 'Improve on-time payments by 65%'
        },
        {
          icon: 'Shield',
          name: 'Workflow Automation Engine',
          description: 'Create custom workflows that trigger actions based on events, dates, or conditions across your portfolio.',
          features: ['Custom Triggers', 'Conditional Logic', 'Multi-step Workflows', 'Event-based Actions'],
          impact: 'Automate repetitive tasks'
        }
      ]
    }
  ]
}