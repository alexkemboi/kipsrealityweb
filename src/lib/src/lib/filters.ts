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

export const filterLinks = {
  approvals: "/properties/leases?leaseStatus=PENDING_APPROVAL",
  expiringLeases: "/properties/leases?leaseStatus=EXPIRING_SOON&endingWithinDays=30",
  openMaintenance: "/maintenance/requests?status=OPEN",
  overdueInvoices: "/accounting/invoices?status=OVERDUE&pastDue=1",
  vacantUnits: "/properties/units?occupied=0",
} as const;
