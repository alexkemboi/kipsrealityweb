// src/components/website/PropertyManager/RegisterPropertyForm.tsx
'use client'
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { postProperty, PropertyPayload } from "@/lib/property-manager";
import toast, { Toaster } from "react-hot-toast";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { useGeocoding } from "@/hooks/useGeocoding";
import { LocationForm } from "@/components/website/PropertyManager/sub-propertyFroms/LocationForm";
import { HouseDetailForm } from "@/components/website/PropertyManager/sub-propertyFroms/HouseDetailForm";
import { ApartmentDetailForm } from "@/components/website/PropertyManager/sub-propertyFroms/ApartmentDetailForm";
import { CondoDetailForm } from "@/components/website/PropertyManager/sub-propertyFroms/CondoDetailForm";
import { LandDetailForm } from "@/components/website/PropertyManager/sub-propertyFroms/landDetailForm";
import { TownhouseDetailForm } from "@/components/website/PropertyManager/sub-propertyFroms/TownhouseDetailForm";
import { ContactDetailsForm } from "@/components/website/PropertyManager/sub-propertyFroms/ContactDetailsForm";
import { Property } from "@/app/data/PropertyData";

interface PropertyFormProps {
  onSuccess?: () => void;
}

export default function PropertyForm({ onSuccess }: PropertyFormProps) {
  const { user } = useAuth();
  const { form, propertyTypes, appliances } = usePropertyForm();
  const { register, handleSubmit, watch, reset, setValue } = form;
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const selectedPropertyTypeId = watch("propertyTypeId");
  const selectedPropertyTypeName = propertyTypes.find(
    (type) => type.id === selectedPropertyTypeId
  )?.name?.toLowerCase();

  const [country, city, zipCode, address] = watch(["country", "city", "zipCode", "address"]);

  const {
    coordinates: mapCoordinates,
    loading: mapLoading,
    showMap,
    setCoordinates: setMapCoordinates,
    setShowMap,
  } = useGeocoding({ country, city, zipCode, address }, setValue);

  const handleMarkerPositionChange = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const onSubmit = async (data: Property) => {
    if (!user) {
      toast.error("You must be logged in to create a property.");
      return;
    }

    if (!data.latitude || !data.longitude) {
      toast.error("Set the property location on the map first.");
      return;
    }

    setLoading(true);
    setUploadProgress("Creating property...");

    const payload: PropertyPayload = {
      manager: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        orgUserId: user.organizationUserId!,
        organizationId: user.organization!.id,
      },
      organizationId: user.organization!.id,
      name: data.name,
      propertyTypeId: selectedPropertyTypeId!,
      locationId: data.locationId!,
      city: data.city,
      address: data.address,
      country: data.country,
      zipCode: data.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
      amenities: data.amenities,
      isFurnished: data.isFurnished,
      availabilityStatus: data.availabilityStatus,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      propertyDetails:
        selectedPropertyTypeName === "apartment"
          ? data.apartmentComplexDetail
          : selectedPropertyTypeName === "house"
          ? data.houseDetail
          : undefined,
      applianceIds: data.applianceIds || [],
    };

    try {
      // Create property
      const result = await postProperty(payload);
      console.log("Property creation result:", result);
      const propertyId = result.property.id;

      console.log("Property created with ID:", propertyId);
      toast.success("Property created successfully!");

      // Upload images if any
      if (data.images && data.images.length > 0) {
        setUploadingImages(true);
        setUploadProgress(`Uploading ${data.images.length} images to Cloudinary...`);
        
        const formData = new FormData();
        formData.append("propertyId", propertyId);

        Array.from(data.images).forEach((file, index) => {
          formData.append("images", file);
          formData.append("orders", index.toString());
        });

        const imageUploadRes = await fetch("/api/property-post/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!imageUploadRes.ok) {
          const errorData = await imageUploadRes.json();
          throw new Error(errorData.error || "Image upload failed");
        }

        const uploadResult = await imageUploadRes.json();
        console.log("Images uploaded and saved:", uploadResult);
        
        toast.success(
          `All done! ${uploadResult.images.length} images uploaded to Cloudinary and saved to database.`
        );
        setUploadingImages(false);
      }

      // Reset form
      reset();
      setMapCoordinates(null);
      setShowMap(false);
      setUploadProgress("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast.error(error.message || "Failed to create property.");
      setUploadProgress("");
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="bg-white">
      <Toaster position="top-center" reverseOrder={false} />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
        <div className="bg-white">
          <div className="flex items-center gap-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Property Details</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <LocationForm
              register={register}
              watch={watch}
              propertyTypes={propertyTypes}
              mapLoading={mapLoading}
              mapCoordinates={mapCoordinates}
              showMap={showMap}
              onMarkerPositionChange={handleMarkerPositionChange}
            />

            {selectedPropertyTypeName === "house" && (
              <HouseDetailForm register={register} />
            )}

            {selectedPropertyTypeName === "apartment" && (
              <ApartmentDetailForm register={register} />
            )}
            
            {(selectedPropertyTypeName === "condominium (condo)" || 
              selectedPropertyTypeName === "condo" || 
              selectedPropertyTypeName === "condominium") && (
              <CondoDetailForm register={register} />
            )}
 
            {selectedPropertyTypeName === "land" && (
              <LandDetailForm register={register} />
            )}

            {selectedPropertyTypeName === "townhouse" && (
              <TownhouseDetailForm register={register} />
            )}

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-500">Additional Options</h2>
              </div>
              
              <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer group">
                <input 
                  type="checkbox" 
                  {...register("isFurnished")} 
                  className="h-5 w-5 accent-blue-200 rounded cursor-pointer" 
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                  Property is Furnished
                </span>
              </label>
            </div>

            <ContactDetailsForm register={register} />

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Property Images</h2>
              <input
                type="file"
                accept="image/*"
                multiple
                {...register("images")}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 hover:file:cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload multiple images (JPG, PNG). Images will be optimized automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImages || !mapCoordinates}
              className={`w-full px-2 py-3 rounded-lg font-bold text-base ${
                loading || uploadingImages || !mapCoordinates
                  ? "bg-blue-600 text-white cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  {"Creating Property..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  Submit Property
                </span>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}