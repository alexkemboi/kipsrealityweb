// export interface Unit {
//   id: string;
//   propertyId: string;
//   complexDetailId?: string | null;
//   houseDetailId?: string | null;
//   unitNumber: string;
//   floorNumber?: number | null;
//   bedrooms?: number | null;
//   bathrooms?: number | null;
//   isOccupied: boolean;
//   rentAmount?: number | null;
//   unitName?: string | null;
//   createdAt: string;
// }
export interface Appliance {
  id: string;
  name: string;
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
  createdAt: string; // must be string
  appliances?: Appliance[];
}
