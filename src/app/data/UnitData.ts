export interface Unit {
  id: string;
  propertyId: string;
  complexDetailId?: string | null;
  houseDetailId?: string | null;
  unitNumber: string;
  floorNumber?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  isOccupied: boolean;
  rentAmount?: number | null;
  tenantName?: string | null;
  createdAt: string;
}
