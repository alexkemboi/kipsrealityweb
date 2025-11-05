  'PROPERTY_MANAGER': {
    main: [
      { path: '/property-manager', label: 'Dashboard Overview', icon: LayoutDashboard },
    ],
    properties: [
      { path: '/property-manager/add-property', label: 'Register Property', icon: Building2 },
      { path: '/property-manager/properties/register', label: 'View Property', icon: Building2 },
      { path: '/property-manager/properties/manage', label: 'Manage Units & Leases', icon: Building2 },
      { path: '/property-manager/properties/vacancy', label: 'Vacancy Tracker', icon: Building2 },
    ],
    tenants : [
      { path: '/property-manager/content/invites', label: 'Invites', icon: Users },
      { path: '/property-manager/content/tenantapplication', label: 'Applications', icon: Users },
      { path: '/property-manager/tenants/moves', label: 'Move-ins / Move-outs', icon: Users },
      { path: '/property-manager/tenants/communication', label: 'Communication', icon: Users },
    ],