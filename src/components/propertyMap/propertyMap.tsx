'use client';
import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  initialLat: number;
  initialLng: number;
  onMarkerPositionChange: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
  isDraggable?: boolean;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  initialLat,
  initialLng,
  onMarkerPositionChange,
  height = '400px',
  zoom = 15,
  isDraggable = true,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      // marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView(
        [initialLat, initialLng],
        zoom
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        draggable: isDraggable,
      }).addTo(map);

      if (isDraggable) {
        marker.on('dragend', () => {
          const { lat, lng } = marker.getLatLng();
          onMarkerPositionChange(lat, lng);
        });
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Fix map sizing issues
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker + map when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    import('leaflet').then((L) => {
      const latLng = L.latLng(initialLat, initialLng);
      markerRef.current.setLatLng(latLng);
      mapInstanceRef.current.setView(latLng, zoom);
    });
  }, [initialLat, initialLng, zoom]);

  return (
    <div className="rounded-lg overflow-hidden shadow-md">
      <div
        ref={mapRef}
        style={{ width: '100%', height }}
        className="z-0"
      />
    </div>
  );
};

export default PropertyMap;
