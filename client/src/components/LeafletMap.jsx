import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

export default function LeafletMap({ 
  center = [20.5937, 78.9629], // Default: India center
  zoom = 5, 
  markers = [], 
  isEditable = false, 
  onLocationSelect,
  selectedLocation = null
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const clickMarkerRef = useRef(null);
  const reportMarkersGroupRef = useRef(null);

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = L.map(mapRef.current).setView(center, zoom);

      // Light/Dark mode responsive map tiles (using Stadia or OpenStreetMap)
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const tileUrl = isDark 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(mapInstance.current);

      // Layer group for reports markers
      reportMarkersGroupRef.current = L.layerGroup().addTo(mapInstance.current);

      // Handle map click in editable mode
      if (isEditable) {
        mapInstance.current.on('click', (e) => {
          const { lat, lng } = e.latlng;
          
          if (clickMarkerRef.current) {
            clickMarkerRef.current.setLatLng(e.latlng);
          } else {
            clickMarkerRef.current = L.marker(e.latlng, {
              draggable: true
            }).addTo(mapInstance.current);

            // Handle dragend event
            clickMarkerRef.current.on('dragend', (de) => {
              const dragLatLng = de.target.getLatLng();
              if (onLocationSelect) {
                onLocationSelect(dragLatLng.lat, dragLatLng.lng);
              }
            });
          }

          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        });
      }
    }

    // Clean up map on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Sync selected location in editable mode (e.g. if set from outside or initial loading)
  useEffect(() => {
    if (mapInstance.current && selectedLocation && isEditable) {
      const latLng = [selectedLocation.lat, selectedLocation.lng];
      mapInstance.current.setView(latLng, 14);

      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng(latLng);
      } else {
        clickMarkerRef.current = L.marker(latLng, { draggable: true }).addTo(mapInstance.current);
        clickMarkerRef.current.on('dragend', (de) => {
          const dragLatLng = de.target.getLatLng();
          if (onLocationSelect) {
            onLocationSelect(dragLatLng.lat, dragLatLng.lng);
          }
        });
      }
    }
  }, [selectedLocation, isEditable]);

  // Sync reports markers list (for dashboard or home page)
  useEffect(() => {
    if (mapInstance.current && reportMarkersGroupRef.current && markers.length > 0) {
      // Clear existing markers
      reportMarkersGroupRef.current.clearLayers();

      markers.forEach(marker => {
        if (!marker.location || !marker.location.lat || !marker.location.lng) return;

        // Custom marker colors depending on status
        let color = '#ef4444'; // Pending - Red
        if (marker.status === 'In Progress') color = '#f59e0b'; // Progress - Orange
        if (marker.status === 'Resolved') color = '#10b981'; // Resolved - Green

        // Simple SVG custom icon
        const customMarkerIcon = L.divIcon({
          html: `<div style="
            background-color: ${color}; 
            width: 14px; 
            height: 14px; 
            border: 2px solid white; 
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            animation: pulseGlow 2.5s infinite;
          "></div>`,
          className: 'custom-map-marker',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const lMarker = L.marker([marker.location.lat, marker.location.lng], {
          icon: customMarkerIcon
        });

        // Add popup
        const popupContent = `
          <div style="font-family: var(--font-sans); min-width: 150px; padding: 4px;">
            <strong style="display: block; font-size: 0.9rem; margin-bottom: 4px;">${marker.title}</strong>
            <span style="font-size: 0.75rem; color: #666; display: block; margin-bottom: 6px;">Category: ${marker.category}</span>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="
                font-size: 0.7rem; 
                padding: 2px 6px; 
                border-radius: 99px; 
                font-weight: 600;
                background-color: ${color}22;
                color: ${color};
              ">${marker.status}</span>
              <a href="/reports/${marker._id || marker.id}" style="font-size: 0.75rem; color: var(--primary); font-weight: 600; text-decoration: none;">View Detail &rarr;</a>
            </div>
          </div>
        `;

        lMarker.bindPopup(popupContent);
        reportMarkersGroupRef.current.addLayer(lMarker);
      });
      
      // Auto-fit bounds if we have markers and we are not in edit mode
      if (markers.length > 0 && !isEditable) {
        const bounds = L.latLngBounds(markers.map(m => [m.location.lat, m.location.lng]));
        mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [markers]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
    </div>
  );
}
