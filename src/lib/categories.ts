import {Categories} from "@/app/data/CategoriesData";


export const fetchCategories = async (): Promise<Categories[]> => {
    try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categoriesmarket`, {
    cache: "no-store",
    });
if(!response.ok){
    console.error(`API Error: ${response.status} ${response.statusText} for ${response.url}`)
    throw new Error("Failed to fetch categories");
}
const data = await response.json();
return data || [];
    }catch(error){
    console.error("fetchAboutUs:", error);
    return [];
    }
}