import {PropertyType} from "@/app/data/PropertTypeData";


export const fetchPropertyTypes = async (): Promise<PropertyType[]> => {
    try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/propertytypes`, {
    cache: "no-store",
    });
if(!response.ok){
    console.error(`API Error: ${response.status} ${response.statusText} for ${response.url}`)
    throw new Error("Failed to fetch property types");
}
const data = await response.json();
return data || [];
    }catch(error){
    console.error("fetchAboutUs:", error);
    return [];
    }
}