export interface Property {
  id: string;
  listingId: string;
  organizationId: string;
  managerId?: string;
  propertyTypeId?: string;
  locationId?: string;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  amenities?: string;
  isFurnished: boolean;
  availabilityStatus?: string; // e.g., "Available", "Occupied", "Maintenance"
  createdAt?: string; // ISO date string
}
