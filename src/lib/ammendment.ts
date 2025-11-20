// Helper function to capture previous values
function capturePreviousValues(lease: any, amendmentType: string, changes: any) {
  const previous: any = {};

  switch (amendmentType) {
    case "RENT_CHANGE":
      previous.rentAmount = lease.rentAmount;
      previous.paymentDueDay = lease.paymentDueDay;
      break;
    
    case "TERM_EXTENSION":
      previous.endDate = lease.endDate;
      previous.leaseTerm = lease.leaseTerm;
      break;
    
    case "UTILITY_CHANGE":
      previous.tenantPaysElectric = lease.tenantPaysElectric;
      previous.tenantPaysWater = lease.tenantPaysWater;
      previous.tenantPaysTrash = lease.tenantPaysTrash;
      previous.tenantPaysInternet = lease.tenantPaysInternet;
      break;
    
    case "RESPONSIBILITY_CHANGE":
      previous.tenantResponsibilities = lease.tenantResponsibilities;
      previous.landlordResponsibilities = lease.landlordResponsibilities;
      break;
    
    case "TENANT_CHANGE":
      previous.tenantId = lease.tenantId;
      break;
    
    case "DEPOSIT_CHANGE":
      previous.securityDeposit = lease.securityDeposit;
      break;
    
    case "FEE_STRUCTURE_CHANGE":
      previous.lateFeeFlat = lease.lateFeeFlat;
      previous.lateFeeDaily = lease.lateFeeDaily;
      previous.gracePeriodDays = lease.gracePeriodDays;
      break;
    
    default:
      // Capture all changed fields
      Object.keys(changes).forEach(key => {
        if (key in lease) {
          previous[key] = lease[key];
        }
      });
  }

  return previous;
}

