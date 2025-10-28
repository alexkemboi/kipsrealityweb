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
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100", 
    text: "RentFlow360 made managing my property effortless. Rent payments are automated and communication is seamless.",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Landlord",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=100&h=100",
    text: "The analytics dashboard is a game changer — I can see all my income and occupancy data in one place.",
  },
  {
    id: 3,
    name: "Jane Brown",
    role: "Agent",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=200&h=200",
    text: "I love how sleek and easy-to-use the system is. RentFlow360 has saved me hours every week.",
  },
    
];