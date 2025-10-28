export interface AboutUs{
    id:number;
    section:string;
    description:string;
}

export const aboutUsData:AboutUs[]=[
    { 
        id:1,
       section:"About Us",
        description:"At RentFlow360, we’re redefining the rental experience with a modern, tech-driven approach. Our platform was built to solve everyday challenges landlords and tenants face—and replace them with a single, seamless solution."
    },
]

export const ourStoryData:AboutUs[]=[
    {
        id:1,
        section:"Our Story",
        description:"RentFlow360 was born out of a simple idea: property management shouldn’t be complicated. Our founders, with deep roots in finance, compliance, and real estate, saw firsthand how people struggled with disconnected systems."
    }
]

export const ourMissionData:AboutUs[]=[
    {
        id:1,
        section:"Our Vision",
        description:"To simplify property management by providing a seamless, technology-driven platform that connects landlords and tenants while ensuring transparency, efficiency, and trust."
    }
]