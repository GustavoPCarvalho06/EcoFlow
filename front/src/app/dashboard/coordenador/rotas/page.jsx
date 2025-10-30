"use client";

import MapboxMap from "@/components/Map/MapboxMap.jsx";

export default function ColetorPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Mapa dos Coletores</h1>
      <MapboxMap latitude={-23.647222} longitude={-46.557282} zoom={14} height="500px" />
    </div>
  );
}