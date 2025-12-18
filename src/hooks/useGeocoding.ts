// src/hooks/useGeocoding.ts
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface GeocodingParams {
  country?: string;
  city?: string;
  zipCode?: string;
  address?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export function useGeocoding(params: GeocodingParams, setValue: any) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const { country, city, zipCode, address } = params;

    if (!country?.trim() || !city?.trim() || !zipCode?.trim() || !address?.trim()) {
      setCoordinates(null);
      setShowMap(false);
      return;
    }

    const geocodeAddress = async () => {
      setLoading(true);
      setShowMap(false);

      try {
        const searchParams = new URLSearchParams({
          country: country.trim(),
          city: city.trim(),
          street: address.trim(),
          zipcode: zipCode.trim(),
        });

        const response = await fetch(`/api/geocode?${searchParams.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Geocoding failed");
        }

        setCoordinates({ lat: data.lat, lng: data.lng });
        setValue("latitude", data.lat);
        setValue("longitude", data.lng);
        setShowMap(true);
        toast.success("Location found! You can adjust the marker on the map.");
      } catch (error: any) {
        toast.error(error.message || "Could not find location. Please check the address.");
        setCoordinates(null);
        setShowMap(false);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(geocodeAddress, 800);
    return () => clearTimeout(timeoutId);
  }, [params.country, params.city, params.zipCode, params.address, setValue]);

  return {
    coordinates,
    loading,
    showMap,
    setCoordinates,
    setShowMap,
  };
}