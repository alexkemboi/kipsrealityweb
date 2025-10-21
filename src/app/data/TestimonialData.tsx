export interface Testimonial {
    id:number;
    name:string;
    role:string;
    image:string;
    text:string
}
export const testimonials:Testimonial[] = [
     {
    id: 1,
    name: "John Doe",
    role: "Tenant",
    image: "/man.jpeg", 
    text: "RentFlow360 made managing my property effortless. Rent payments are automated and communication is seamless.",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Landlord",
    image: "/lady.jpg",
    text: "The analytics dashboard is a game changer — I can see all my income and occupancy data in one place.",
  },
  {
    id: 3,
    name: "Jane Brown",
    role: "Agent",
    image: "/smile.jpeg",
    text: "I love how sleek and easy-to-use the system is. RentFlow360 has saved me hours every week.",
  },
    
];