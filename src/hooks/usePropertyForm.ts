import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Property } from "@/app/data/PropertyData";
import { PropertyType } from "@/app/data/PropertTypeData";
import { Appliance } from "@/app/data/ApplianceData";
import { fetchPropertyTypes } from "@/lib/property-type";
import { fetchAppliances } from "@/lib/appliance";
import toast from "react-hot-toast";

export function usePropertyForm() {
  const form = useForm<Property>({
    defaultValues: {
      houseDetail: { houseName: "", numberOfFloors: 0, bedrooms: 0, bathrooms: 0, size: 0 },
      apartmentComplexDetail: { buildingName: "", totalFloors: 0, totalUnits: 0 },
      applianceIds: [],
      isFurnished: false,
    },
  });

  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const [types, apps] = await Promise.all([
          fetchPropertyTypes(),
          fetchAppliances(),
        ]);
        setPropertyTypes(types);
        setAppliances(apps);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load property types or appliances.");
      }
    };
    getData();
  }, []);

  return {
    form,
    propertyTypes,
    appliances,
  };
}