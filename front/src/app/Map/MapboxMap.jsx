"use client";

import React, { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_STYLES } from "./mapStyles.js";

export default function MapboxMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let mapboxgl;

    (async () => {
      const module = await import("mapbox-gl");
      mapboxgl = module.default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      // buscar pontos
      const response = await fetch("http://localhost:3001/statusSensor");
      const data = await response.json();

      if (!data || data.length === 0) {
        console.warn("Nenhum ponto recebido.");
        return;
      }

      // inico - MUDAR DPS
      const center = [data[0].Coordenadas.x, data[0].Coordenadas.y];

      // inicia o mpaa
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_STYLES.day,
        center,
        zoom: 14,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl());

      // markers
      data.forEach((ponto) => {
        const { x, y } = ponto.Coordenadas;
        let color = "gray";
        if (ponto.Stats === "Vazia") color = "green";
        else if (ponto.Stats === "Quase Cheia") color = "orange";
        else if (ponto.Stats === "Cheia") color = "red";

        const el = document.createElement("div");
        el.style.backgroundColor = color;
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 0 4px rgba(0,0,0,0.5)";
        el.style.cursor = "pointer";

        new mapboxgl.Marker(el)
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


      // Directions API
      const coords = data
        .map((p) => `${p.Coordenadas.x},${p.Coordenadas.y}`)
        .join(";");

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

      // busca rota
      const routeResponse = await fetch(directionsUrl);
      const routeData = await routeResponse.json();

      if (!routeData.routes || !routeData.routes[0]) {
        console.warn("Nenhuma rota encontrada.");
        return;
      }

      const route = routeData.routes[0].geometry;

      // adiciona rota
      mapRef.current.on("load", () => {
        mapRef.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: route,
          },
        });

        mapRef.current.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#0074D9",
            "line-width": 6,
          },
        });

        // zoom para ter tudo
        const bounds = new mapboxgl.LngLatBounds();
        route.coordinates.forEach((coord) => bounds.extend(coord));
        mapRef.current.fitBounds(bounds, { padding: 50 });
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
        height: "1000px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}
