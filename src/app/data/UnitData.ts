export interface Appliance {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

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
  unitName?: string | null;
  createdAt: string;

  //  This is the correct way:
  appliances?: Appliance[];
}


// types/unit.ts
export interface ApplianceInput {
  name: string;
}

export interface UnitFormData {
  bedrooms: number;
  bathrooms: number;
  floorNumber?: number | null;
  rentAmount?: number | null;
  unitName?: string;
  isOccupied?: boolean;
  appliances?: ApplianceInput[];
}
