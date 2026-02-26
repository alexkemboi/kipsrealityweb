export const filters = {
  leases: {
    leaseStatusParam: "leaseStatus",
    endingWithinDaysParam: "endingWithinDays",
  },
  invoices: {
    statusParam: "status",
    pastDueParam: "pastDue",
  },
  maintenance: {
    statusParam: "status",
  },
  units: {
    occupiedParam: "occupied",
  },
} as const;

/**
 * Property Manager filtered-view links.
 * Update these paths only if your actual PM pages use different routes.
 */
export const filterLinks = {
  approvals: "/property-manager/leases?leaseStatus=PENDING_APPROVAL",
  expiringLeases: "/property-manager/leases?leaseStatus=EXPIRING_SOON&endingWithinDays=30",
  openMaintenance: "/property-manager/maintenance?status=OPEN",
  overdueInvoices: "/property-manager/finance/invoices?status=OVERDUE&pastDue=1",
  vacantUnits: "/property-manager/units?occupied=0",
} as const;
