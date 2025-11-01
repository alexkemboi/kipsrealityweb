import {Appliance} from "@/app/data/ApplianceData";


export const fetchAppliances = async (): Promise<Appliance[]> => {
    try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/appliances`, {
    next: { revalidate: 60 },
    });
if(!response.ok){
    console.error(`API Error: ${response.status} ${response.statusText} for ${response.url}`)
    throw new Error("Failed to fetch appliances");
}
const data = await response.json();
return data || [];
    }catch(error){
    console.error("fetchAppliances:", error);
    return [];
    }
}