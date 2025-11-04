export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: "property" | "furniture" | "appliance" | "decor" | "service"; 
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  amenities?: string | null;
  isFurnished?: boolean;
  dateposted: string;
  postedBy: string;
  verified: boolean;
}



// export const marketplaceListings: MarketplaceItem[] = [
//   {
//     id: 1,
//     title: "2-Bedroom Apartment in Kilimani",
//     description:
//       "Modern 2-bedroom apartment with balcony, gym access, and secure parking. Close to shopping malls and public transport.",
//     image:
//       "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
//     category: "property",
//     price: 95000,
//     location: "Kilimani, Nairobi",
//     type: "rent",
//     postedBy: "Kips Realty",
//     verified: true,
//     datePosted: "2025-10-23",
//   },
//   {
//     id: 2,
//     title: "3-Seater Leather Sofa Set",
//     description:
//       "Premium brown leather sofa set in great condition. Ideal for apartments or home offices.",
//     image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=500&fit=crop",
//     category: "furniture",
//     price: 35000,
//     location: "Westlands, Nairobi",
//     postedBy: "HomeStyle Kenya",
//     verified: true,
//     datePosted: "2025-10-22",
//   },
//   {
//     id: 3,
//     title: "Samsung 55-Inch Smart TV",
//     description:
//       "Brand new Samsung 4K UHD Smart TV with 2-year warranty. Includes free installation.",
//     image:
//       "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=500&fit=crop",
//     category: "appliance",
//     price: 72000,
//     location: "Nakuru",
//     postedBy: "TechWorld Electronics",
//     verified: true,
//     datePosted: "2025-10-20",
//   },
//   {
//     id: 4,
//     title: "Interior Design Consultation Service",
//     description:
//       "Professional interior design service to help you redesign your living space. Includes a free initial consultation.",
//     image:
//       "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
//     category: "service",
//     price: 5000,
//     location: "Nairobi",
//     postedBy: "DesignCo Studio",
//     verified: false,
//     datePosted: "2025-10-18",
//   },
//   {
//     id: 5,
//     title: "Studio Apartment for Sale",
//     description:
//       "Newly built studio apartment ideal for short-term stays or Airbnb investment. Located near Yaya Center.",
//     image:
//       "https://images.unsplash.com/photo-1702014862053-946a122b920d?w=800&h=500&fit=crop",
//     category: "property",
//     price: 5200000,
//     location: "Yaya, Nairobi",
//     type: "sale",
//     postedBy: "Sunrise Developers",
//     verified: true,
//     datePosted: "2025-10-10",
//   },
// ];
