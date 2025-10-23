"use client";

import React, { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapboxMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let mapboxgl;

    (async () => {
      const module = await import("mapbox-gl");
      mapboxgl = module.default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      // busca pontos
      const response = await fetch("http://localhost:3001/statusSensor");
      const data = await response.json();

      if (!data || data.length === 0) {
        console.warn("Nenhum ponto recebido.");
        return;
      }

      // MUDAR DPS - PONTO INICIAL
      const center = [
        data[0].Coordenadas.x,
        data[0].Coordenadas.y
      ];

      // start no mapa
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center,
        zoom: 14.8,
        pitch: 0,
        bearing: 40
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl());

      // adiciona os pontos
      data.forEach((ponto) => {
        const { x, y } = ponto.Coordenadas;

        // Cor dos status
        let color = "gray";
        if (ponto.Stats === "Vazia") color = "green";
        else if (ponto.Stats === "Quase Cheia") color = "orange";
        else if (ponto.Stats === "Cheia") color = "red";

        // pontos de coleta
        const marker = new mapboxgl.Marker({ color })
          .setLngLat([x, y])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <strong>ID:</strong> ${ponto.ID}<br/>
              <strong>Status:</strong> ${ponto.Stats}<br/>
              <strong>Lat:</strong> ${y}<br/>
              <strong>Lng:</strong> ${x}
            `)
          )
          .addTo(mapRef.current);
      });

      // 3D
      mapRef.current.on("style.load", () => {
        const layers = mapRef.current.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === "symbol" && layer.layout["text-field"]
        )?.id;

        mapRef.current.addLayer(
          {
            id: "add-3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "min_height"],
              ],
              "fill-extrusion-opacity": 0.6,
            },
          },
          labelLayerId
        );
      });
    })();

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}
