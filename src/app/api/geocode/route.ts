import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const country = searchParams.get("country");
  const city = searchParams.get("city");
  const zipcode = searchParams.get("zipcode");
  const street = searchParams.get("street");

  // Basic validation
  if (!country || !city || !street) {
    return NextResponse.json(
      { error: "Country, city, and street address are required" },
      { status: 400 }
    );
  }

  // Build a single address string for Nominatim
  const addressParts = [
    street,
    zipcode,
    city,
    country,
  ].filter(Boolean); // remove empty values

  const fullAddress = addressParts.join(", ");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        fullAddress
      )}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "rentflow360",
        },
      }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
      displayName: data[0].display_name,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 500 }
    );
  }
}