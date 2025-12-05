"use client";

import React, { useEffect, useRef } from "react";
import MapboxMap from "./MapboxMap";

/**
 * MainMapWrapper:
 * - wraps MapboxMap and listens for the 'sensorCreated' event.
 * - when event fires, calls the refresh function exposed by MapboxMap via onRefreshReady.
 */
export default function MainMapWrapper({ latitude = -23.647222, longitude = -46.557282, zoom = 14 }) {
  const refreshRef = useRef(null);

  useEffect(() => {
    const onSensorCreated = () => {
      refreshRef.current?.();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("sensorCreated", onSensorCreated);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("sensorCreated", onSensorCreated);
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
