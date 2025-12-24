import { ReactNode } from "react";

export interface MarketplaceItem {
  contact: any;
  dateposted: ReactNode;
  postedBy: ReactNode;
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  location: string;

  unitId?: string | null;
  propertyId?: string | null;
  unit?: {
    id: string;
    unitNumber?: string;
    property?: {
      id: string; // required after normalization
      name?: string;
    };
  } | null;
  property?: {
    id: string; // required after normalization
    name?: string;
  } | null;
}



export const marketplaceListings: MarketplaceItem[] = [];
