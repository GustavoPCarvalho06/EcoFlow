"use client";

import React, { useRef, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_STYLES } from "./mapStyles.js";

export default function MapboxMap({
  latitude = -23.647222,
  longitude = -46.557282,
  zoom = 15,
  height = "400px",
  styleType = "streets",
  enable3D = true,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let mapboxgl;
    import("mapbox-gl").then((module) => {
      mapboxgl = module.default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      if (!mapContainer.current) return;

      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_STYLES[styleType] || MAPBOX_STYLES.streets,
        center: [longitude, latitude],
        zoom: zoom,
        pitch: enable3D ? 45 : 0,
        bearing: enable3D ? -17.6 : 0,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl());

      if (enable3D) {
        mapRef.current.on("load", () => {
          // Add terrain
          mapRef.current.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
          mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

          // Add 3D buildings
          mapRef.current.addLayer({
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.6,
            },
          });
        });
      }
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [latitude, longitude, zoom, styleType, enable3D]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: height, borderRadius: "8px" }}
    />
  );
}
