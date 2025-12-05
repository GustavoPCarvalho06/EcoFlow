"use client";

import React, { useEffect, useRef } from "react";
import MapboxMap from "./MapboxMap";

export default function MainMapWrapper({ latitude = -23.647222, longitude = -46.557282, zoom = 14 }) {
  const refreshRef = useRef(null);

  useEffect(() => {
    const refresh = () => refreshRef.current?.();

    if (typeof window !== "undefined") {
      window.addEventListener("sensorCreated", refresh);
      window.addEventListener("sensorUpdated", refresh);
      window.addEventListener("sensorDeleted", refresh);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("sensorCreated", refresh);
        window.removeEventListener("sensorUpdated", refresh);
        window.removeEventListener("sensorDeleted", refresh);
      }
    };
  }, []);

  return (
    <MapboxMap
      latitude={latitude}
      longitude={longitude}
      zoom={zoom}
      onRefreshReady={(fn) => {
        refreshRef.current = fn;
      }}
    />
  );
}
