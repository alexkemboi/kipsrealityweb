export interface Property {
  id: string;
  listingId: string;
  managerId?: string | null;
  organizationId?: string | null;
  propertyTypeId?: string | null;
  locationId?: string | null;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  amenities?: string | null;
  isFurnished: boolean;
  availabilityStatus?: string | null;
  createdAt: Date;
}
