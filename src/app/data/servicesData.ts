export const theme = {
  primary: '#1F2933', // Dark text/headings
  secondary: '#003b73', // Main Green
  accent: '#003b73', // Main Green
  white: '#FFFFFF',
  hover: '#002b5b',
  background: '#f0f7ff', // Soft section background
  border: 'rgba(93, 187, 107, 0.25)',
  text: '#4B5563', // Body text
}

export const servicesData = {
  hero: {
    badge: '', // 
    title: 'Built for Landlords, ',
    highlight: ' Managers,',
    subtitle: 'and Tenants Alike',
    description: 'From tenant screening to financial reporting, our platform delivers every service you need to run a modern, efficient property management business.',
    buttonUrl: '/signup' // Redirect to signup
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
      icon: 'UserCheck',
      name: 'Tenant Management',
      tagline: 'Find, verify & retain quality tenants',
      color: '#003b73',
      services: [
        {
          icon: 'ShieldCheck',
          name: 'Advanced Tenant Screening',
          description: 'Multi-layered background verification including criminal records, credit history, employment verification, and rental history.',
          features: ['Identity Verification', 'Credit Score Analysis', 'Employment Checks', 'Eviction History'],
          impact: 'Reduce bad tenant risk by 85%'
        },
        {
          icon: 'Wallet',
          name: 'Financial Assessment',
          description: 'Comprehensive financial profiling with income verification, debt-to-income ratios, and payment history analysis.',
          features: ['Real-time Credit Scores', 'Income Verification', 'Bank Statement Analysis', 'Payment Behavior Tracking'],
          impact: 'Make confident decisions in minutes'
        },
        {
          icon: 'UserPlus',
          name: 'Onboarding System',
          description: 'Streamline tenant onboarding with digital applications, instant verification, and automated approval workflows.',
          features: ['Online Applications', 'Document Upload Portal', 'Auto-verification', 'E-signature Integration'],
          impact: 'Process applications 10x faster'
        }
      ]
    },
    {
      id: 'property',
      icon: 'Building2',
      name: 'Property Operations',
      tagline: 'Optimize every aspect of property management',
      color: '#003b73',
      services: [
        {
          icon: 'Megaphone',
          name: 'Property Listings',
          description: 'Create stunning, SEO-optimized listings with virtual tours, floor plans, and instant syndication to major rental platforms.',
          features: ['Multi-platform Publishing', 'Virtual Tours', '3D Floor Plans', 'Automated Updates'],
          impact: 'Fill vacancies 40% faster'
        },
        {
          icon: 'FileSignature',
          name: 'Lease Management',
          description: 'Complete lease lifecycle management from creation to renewal, with e-signatures, version control, and compliance tracking.',
          features: ['Customizable Templates', 'E-signatures', 'Auto-renewal Reminders', 'Compliance Tracking'],
          impact: 'Zero paperwork, 100% compliant'
        },
        {
          icon: 'Wrench',
          name: 'Maintenance Coordination',
          description: 'Intelligent ticket routing, vendor management, and real-time status tracking for all maintenance requests.',
          features: ['Tenant Request Portal', 'Vendor Dispatch', 'Priority Routing', 'Photo Documentation'],
          impact: 'Resolve issues 3x faster'
        },
        {
          icon: 'LineChart',
          name: 'Occupancy Analytics',
          description: 'Real-time vacancy tracking, market analysis, and predictive insights to maximize occupancy and revenue.',
          features: ['Vacancy Dashboard', 'Market Comparisons', 'Revenue Forecasting', 'Seasonal Trends'],
          impact: 'Maximize occupancy rates'
        }
      ]
    },
    {
      id: 'financial',
      icon: 'Banknote',
      name: 'Financial Management',
      tagline: 'Complete financial control & transparency',
      color: '#003b73',
      services: [
        {
          icon: 'Scale',
          name: 'Financial Reconciliation',
          description: 'Automated payment matching, bank reconciliation, and multi-property financial consolidation with audit trails.',
          features: ['Bank Integration', 'Auto-reconciliation', 'Multi-property View', 'Audit Trails'],
          impact: 'Save 20+ hours per month'
        },
        {
          icon: 'Droplets',
          name: 'Utility Management',
          description: 'Automated utility bill generation based on meter readings, consumption tracking, and split billing capabilities.',
          features: ['Meter Reading Input', 'Consumption Analytics', 'Split Billing', 'Auto-calculations'],
          impact: 'Eliminate billing errors'
        },
        {
          icon: 'FileBarChart',
          name: 'Reporting Suite',
          description: 'Customizable financial reports, performance dashboards, and predictive analytics for informed decision-making.',
          features: ['Custom Report Builder', 'Performance Metrics', 'Export Options', 'Scheduled Reports'],
          impact: 'Data-driven insights instantly'
        }
      ]
    },
    {
      id: 'automation',
      icon: 'Zap',
      name: 'Automation Hub',
      tagline: 'Let technology do the heavy lifting',
      color: '#003b73',
      services: [
        {
          icon: 'Receipt',
          name: 'Invoice Automation',
          description: 'Auto-generate recurring invoices based on lease terms, utilities, and custom charges with zero manual input.',
          features: ['Recurring Invoices', 'Late Fee Auto-calculation', 'Custom Charges', 'Payment Links'],
          impact: 'Never miss a billing cycle'
        },
        {
          icon: 'MessageCircle',
          name: 'Communication Hub',
          description: 'Automated reminders, notifications, and announcements via SMS, email, and in-app messaging.',
          features: ['Rent Reminders', 'Lease Renewals', 'Maintenance Updates', '2-Way Messaging'],
          impact: 'Improve on-time payments by 65%'
        },
        {
          icon: 'GitBranch',
          name: 'Workflow Engine',
          description: 'Create custom workflows that trigger actions based on events, dates, or conditions across your portfolio.',
          features: ['Custom Triggers', 'Conditional Logic', 'Multi-step Workflows', 'Event-based Actions'],
          impact: 'Automate repetitive tasks'
        }
      ]
    }
  ]
}