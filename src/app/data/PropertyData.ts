export interface Property {
  id?: string;
  listingId?: string;
  managerId?: string;
  name?: string;
  organizationId?: string;
  propertyTypeId: string;
  locationId?: string;
  city: string;
  address: string;
  
  amenities?: string;
  isFurnished?: boolean;
  availabilityStatus?: string;
  createdAt?: string;

  // Nested details
  apartmentComplexDetail?: ApartmentComplexDetail;
  houseDetail?: HouseDetail;

  // Frontend-only fields (not in Prisma schema)
  applianceIds?: string[];
}

export interface ApartmentComplexDetail {
  buildingName?: string;
  totalFloors?: number;
  totalUnits?: number;
}

export interface HouseDetail {
  numberOfFloors?: number;
  bedrooms?: number;
  bathrooms?: number;
 houseName?: string;
  size?: number;
    totalUnits?: number;

}
