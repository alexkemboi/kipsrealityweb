/**
 * Filter links for dashboard sidebar navigation
 * These are pre-configured URLs with query parameters for filtered views
 */
export const filterLinks = {
  // Approvals queue (pending leases)
  approvals: '/property-manager/approvals?status=pending',
  
  // Unit filters
  vacantUnits: '/property-manager/units?occupied=0',
  occupiedUnits: '/property-manager/units?occupied=1',
  
  // Lease filters
  expiringLeases: '/property-manager/leases?status=active&expiringSoon=true',
  activeLeases: '/property-manager/leases?status=active',
  pendingLeases: '/property-manager/leases?status=pending',
  
  // Maintenance filters
  openMaintenance: '/property-manager/maintenance?status=OPEN',
  inProgressMaintenance: '/property-manager/maintenance?status=IN_PROGRESS',
  completedMaintenance: '/property-manager/maintenance?status=COMPLETED',
  
  // Invoice filters
  overdueInvoices: '/property-manager/finance/invoices?status=OVERDUE',
  paidInvoices: '/property-manager/finance/invoices?status=PAID',
  pendingInvoices: '/property-manager/finance/invoices?status=PENDING',
  
  // Application filters
  pendingApplications: '/property-manager/applications?status=PENDING',
  approvedApplications: '/property-manager/applications?status=APPROVED',
  rejectedApplications: '/property-manager/applications?status=REJECTED',
} as const;