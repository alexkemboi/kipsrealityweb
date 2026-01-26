// src/app/data/PropertyData.ts
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

  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  
  amenities?: string;
  isFurnished?: boolean;
  availabilityStatus?: string;
  createdAt?: string;

  // Nested details
  apartmentComplexDetail?: ApartmentComplexDetail;
  houseDetail?: HouseDetail;
  condoDetail?: CondoDetail;
  landDetail?: LandDetail;
  townhouseDetail?: TownhouseDetail;



  // Frontend-only fields (not in Prisma schema)
  applianceIds?: string[];
  images?: FileList;
}

export interface ApartmentComplexDetail {
  id: string;
  propertyId: string;
  buildingName?: string;
  totalFloors?: number;
  unitNumber?: string;
  size?: number;         // square feet
  bedrooms?: number;
  bathrooms?: number;
  totalUnits?: number;
  zoning?: string;
}


export interface HouseDetail {
  numberOfFloors?: number;
  bedrooms?: number;
  bathrooms?: number;
 houseName?: string;
  size?: number;
    totalUnits?: number;

}

export interface CondoDetail {
  buildingName?: string;
  floorNumber?: number;
  unitNumber?: string;
  totalFloorsInBuilding?: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  hoaFees?: number;
  hasBalcony?: boolean;
  amenities?: string;
}

export interface LandDetail {
  lotSize?: number;
  zoning?: string;
  isSubdivided?: boolean;
  hasUtilities?: boolean;
  topography?: string;
  soilType?: string;
  accessRoad?: boolean;
  landUse?: string;
}

export interface TownhouseDetail {
  townhouseName?: string;
  numberOfFloors?: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  unitNumber?: string;
  endUnit?: boolean;
  hasGarage?: boolean;
  garageSpaces?: number;
  hasBackyard?: boolean;
  backyardSize?: number;
  hoaFees?: number;
  zoning?: string;
}
