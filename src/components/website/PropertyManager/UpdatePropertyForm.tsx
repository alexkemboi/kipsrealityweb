"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Property } from "@/app/data/PropertyData";
import { PropertyType } from "@/app/data/PropertTypeData";
import { Appliance } from "@/app/data/ApplianceData";
import { fetchPropertyTypes } from "@/lib/property-type";
import { fetchAppliances } from "@/lib/appliance";
import { updateProperty, PropertyPayload } from "@/lib/property-manager";
import { HomeIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface EditPropertyFormProps {
  initialData: any; 
  onSuccess?: () => void;
}

interface ApiProperty {
  id: string;
  name: string;
  city: string;
  address: string;
  type: string; 
  isFurnished: boolean;
  availabilityStatus: string;
  details: any; 
  manager: any;
  organization: any;
  createdAt: string;
}

export default function EditPropertyForm({ initialData, onSuccess }: EditPropertyFormProps) {
  const { register, handleSubmit, reset, watch } = useForm<any>({
    defaultValues: initialData,
  });

  const { user } = useAuth();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(false);
  
  const propertyTypeName = initialData.type?.toLowerCase() || "";
  
  useEffect(() => {
    console.log("Initial data in EditPropertyForm:", initialData);
  }, [initialData]);

  useEffect(() => {
    const getData = async () => {
      try {
        const [types, apps] = await Promise.all([fetchPropertyTypes(), fetchAppliances()]);
        setPropertyTypes(types);
        setAppliances(apps);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load property types or appliances.");
      }
    };
    getData();

    // Reset form with data from API response
    reset({
      // Basic info
      city: initialData.city || "",
      address: initialData.address || "",
      isFurnished: initialData.isFurnished || false,
      availabilityStatus: initialData.availabilityStatus || "available",
      amenities: initialData.amenities || "",
      
      // Property type info
      type: initialData.type || "",
      propertyTypeId: initialData.propertyTypeId || "",
      
      // Details - map from API response to form structure
      houseDetail: initialData.type?.toLowerCase() === "house" ? {
        houseName: initialData.details?.houseName || "",
        numberOfFloors: initialData.details?.numberOfFloors || 0,
        bedrooms: initialData.details?.bedrooms || 0,
        bathrooms: initialData.details?.bathrooms || 0,
        size: initialData.details?.size || 0,
        totalUnits: initialData.details?.totalUnits || 0,
      } : {},
      
      apartmentComplexDetail: initialData.type?.toLowerCase() === "apartment" ? {
        buildingName: initialData.details?.buildingName || "",
        totalFloors: initialData.details?.totalFloors || 0,
        totalUnits: initialData.details?.totalUnits || 0,
      } : {},
    });
  }, [initialData, reset]);

  const onSubmit = async (data: any) => {
    if (!user) return toast.error("You must be logged in to edit a property.");

    setLoading(true);

    try {
      // property details based on type
      let propertyDetails = {};
      
      if (propertyTypeName === "apartment") {
        propertyDetails = {
          buildingName: data.apartmentComplexDetail?.buildingName || "",
          totalFloors: data.apartmentComplexDetail?.totalFloors || 0,
          totalUnits: data.apartmentComplexDetail?.totalUnits || 0,
        };
      } else if (propertyTypeName === "house") {
        propertyDetails = {
          houseName: data.houseDetail?.houseName || "",
          numberOfFloors: data.houseDetail?.numberOfFloors || 0,
          bedrooms: data.houseDetail?.bedrooms || 0,
          bathrooms: data.houseDetail?.bathrooms || 0,
          size: data.houseDetail?.size || 0,
          totalUnits: data.houseDetail?.totalUnits || 0,
        };
      }

      let propertyTypeId = data.propertyTypeId;
      
      // find it from property types
      if (!propertyTypeId && propertyTypes.length > 0) {
        const foundType = propertyTypes.find(
          (type) => type.name.toLowerCase() === propertyTypeName
        );
        if (foundType) {
          propertyTypeId = foundType.id;
        }
      }

      const payload = {
        id: initialData.id, // Property ID for the update
        city: data.city,
        address: data.address,
        locationId: initialData.locationId, 
        amenities: data.amenities,
        isFurnished: data.isFurnished,
        availabilityStatus: data.availabilityStatus,
        propertyDetails: propertyDetails,
        propertyTypeId: propertyTypeId,
      };

      await updateProperty(initialData.id, payload);
      toast.success("Property updated successfully!");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast.error(error.message || "Failed to update property.");
    } finally {
      setLoading(false);
    }
  };

  // Get display name for property type
  const getPropertyTypeDisplayName = () => {
    if (initialData.type) {
      return initialData.type.charAt(0).toUpperCase() + initialData.type.slice(1);
    }
    return "Property";
  };

  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-xl">
      <Toaster position="top-center" />
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-600 text-white rounded-full shadow-lg">
          <HomeIcon className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Edit {getPropertyTypeDisplayName()}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Property Type Display (Read-only) */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Type
          </label>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
              {propertyTypeName || "Unknown"}
            </span>
            <span className="text-sm text-gray-500">
              (Property type cannot be changed)
            </span>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex flex-row md:col-span-2 gap-12">
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="city" className="text-sm font-semibold text-gray-700 mb-1">
                City *
              </label>
              <input
                id="city"
                {...register("city", { required: "City is required" })}
                placeholder="Enter city"
                className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label htmlFor="address" className="text-sm font-semibold text-gray-700 mb-1">
                Address *
              </label>
              <input
                id="address"
                {...register("address", { required: "Address is required" })}
                placeholder="Enter full address"
                className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
                 </div>
             </div>
          </div>
        </div>

        {/* House Fields */}
        {propertyTypeName === "house" && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">House Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label htmlFor="houseName" className="text-sm font-semibold text-gray-700 mb-1">
                  House Name
                </label>
                <input
                  id="houseName"
                  {...register("houseDetail.houseName")}
                  placeholder="Enter house name"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="numberOfFloors" className="text-sm font-semibold text-gray-700 mb-1">
                  Number of Floors
                </label>
                <input
                  id="numberOfFloors"
                  type="number"
                  {...register("houseDetail.numberOfFloors", { valueAsNumber: true })}
                  placeholder="Enter number of floors"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="bedrooms" className="text-sm font-semibold text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  id="bedrooms"
                  type="number"
                  {...register("houseDetail.bedrooms", { valueAsNumber: true })}
                  placeholder="Enter bedrooms"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="bathrooms" className="text-sm font-semibold text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  id="bathrooms"
                  type="number"
                  {...register("houseDetail.bathrooms", { valueAsNumber: true })}
                  placeholder="Enter bathrooms"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="size" className="text-sm font-semibold text-gray-700 mb-1">
                  Size (sqft)
                </label>
                <input
                  id="size"
                  type="number"
                  {...register("houseDetail.size", { valueAsNumber: true })}
                  placeholder="Enter size in sqft"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="totalUnits" className="text-sm font-semibold text-gray-700 mb-1">
                  Total Units
                </label>
                <input
                  id="totalUnits"
                  type="number"
                  {...register("houseDetail.totalUnits", { valueAsNumber: true })}
                  placeholder="Enter total units"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Apartment Fields */}
        {propertyTypeName === "apartment" && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Apartment Complex Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label htmlFor="buildingName" className="text-sm font-semibold text-gray-700 mb-1">
                  Building Name
                </label>
                <input
                  id="buildingName"
                  {...register("apartmentComplexDetail.buildingName")}
                  placeholder="Enter building name"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="totalFloors" className="text-sm font-semibold text-gray-700 mb-1">
                  Total Floors
                </label>
                <input
                  id="totalFloors"
                  type="number"
                  {...register("apartmentComplexDetail.totalFloors", { valueAsNumber: true })}
                  placeholder="Enter total floors"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="totalUnits" className="text-sm font-semibold text-gray-700 mb-1">
                  Total Units
                </label>
                <input
                  id="totalUnits"
                  type="number"
                  {...register("apartmentComplexDetail.totalUnits", { valueAsNumber: true })}
                  placeholder="Enter total units"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Additional Options */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFurnished"
              {...register("isFurnished")}
              className="h-5 w-5 accent-blue-600 rounded"
            />
            <label htmlFor="isFurnished" className="text-sm font-medium text-gray-700">
              This property is furnished
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating Property..." : "Update Property"}
        </button>
      </form>
    </div>
  );
}