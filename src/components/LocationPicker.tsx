import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number } | null) => void;
  defaultCenter?: [number, number];
}

function LocationMarker({
  position,
  setPosition,
}: {
  position: { lat: number; lng: number } | null;
  setPosition: (pos: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

const LocationPicker = ({ value, onChange, defaultCenter = [25.097, 94.361] }: LocationPickerProps) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(value || null);
  const [isLocating, setIsLocating] = useState(false);

  const handlePositionChange = useCallback((pos: { lat: number; lng: number }) => {
    setPosition(pos);
    onChange(pos);
  }, [onChange]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        handlePositionChange(newPos);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Please allow location access or pin manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClear = () => {
    setPosition(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="gap-2"
        >
          <Navigation className={`h-4 w-4 ${isLocating ? "animate-pulse" : ""}`} />
          {isLocating ? "Getting location..." : "Use My Location"}
        </Button>
        {position && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="gap-1 text-muted-foreground">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border h-64 relative">
        <MapContainer
          center={position ? [position.lat, position.lng] : defaultCenter}
          zoom={position ? 16 : 13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
        <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          {position ? (
            <span>Location set: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
          ) : (
            <span>Tap on the map to pin your delivery location</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
