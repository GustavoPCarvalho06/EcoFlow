"use client";

import React, { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_STYLES } from "./mapStyles.js";

import { useApiUrl } from "@/app/context/ApiContext.js";

export default function MapboxMap({ onMapClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapboxRef = useRef(null);
  const [filtro, setFiltro] = useState("-");
  const [pontos, setPontos] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [rotaInfo, setRotaInfo] = useState(null);

  const refreshPoints = async () => {
  try {
    const response = await fetch(`${apiUrl}/statusSensor`);
    const data = await response.json();
    setPontos(data);
  } catch {}
};


  const apiUrl = useApiUrl();

  const usuario = { x: -46.559689, y: -23.64434 };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        const response = await fetch(`${apiUrl}/statusSensor`);
        const data = await response.json();
        setPontos(data);
      } catch (err) {
        console.error("Erro ao buscar sensores:", err);
      }
    })();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      const module = await import("mapbox-gl");
      const mapboxgl = module.default;
      mapboxRef.current = mapboxgl;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      if (mapContainer.current && !mapRef.current) {
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: MAPBOX_STYLES.outdoor,
          center: [usuario.x, usuario.y],
          zoom: 16,
          pitch: 0,
          bearing: 0,
          antialias: true,
        });

        
        if (onMapClick) {
          map.on("click", (e) => {
            const { lng, lat } = e.lngLat;

            onMapClick({ lat, lng })
            if (markerRef.current) {
              markerRef.current.setLngLat([lng, lat]);
            } else {
              markerRef.current = new mapboxgl.Marker({ color: "#FF2020" })
                .setLngLat([lng, lat])
                .addTo(map);
            }
          });
        }
        mapRef.current = map;
        map.addControl(new mapboxgl.NavigationControl());
        map.on("click", (e) => {
          if (onMapClick) {
            onMapClick({
              lat: e.lngLat.lat,
              lng: e.lngLat.lng,
            });
          }
        });


        if (!apiUrl) {
          setError("Conectando ao servidor... Por favor, tente novamente em um instante.");
          return;
        }

        
        const UsuarioMarker = document.createElement("div");
        UsuarioMarker.className = "marker";
        UsuarioMarker.style.backgroundImage = "url('https://i.imgur.com/MK4NUzI.png')";
        UsuarioMarker.style.width = "32px";
        UsuarioMarker.style.height = "40px";

        new mapboxgl.Marker(UsuarioMarker)
          .setLngLat([usuario.x, usuario.y])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
    <div style="
      font-family: Arial, sans-serif;
      padding: 10px 14px;
      border-radius: 10px;
      background: white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      min-width: 140px;
      text-align: center;
    ">
      <div style="
        font-size: 16px;
        font-weight: 700;
        color: #333;
        margin-bottom: 4px;
      ">
        📍 Você está aqui
      </div>

      <div style="
        font-size: 12px;
        color: #666;
      ">
        Seu ponto atual
      </div>
    </div>
  `)
          )

          .addTo(map);

        // 3D
        map.on("load", () => {
          const layers = map.getStyle().layers;
          const labelLayerId = layers.find(
            (layer) => layer.type === "symbol" && layer.layout["text-field"]
          )?.id;

          map.addLayer(
            {
              id: "3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: 16.5,
              paint: {
                "fill-extrusion-color": "#aaa",
                "fill-extrusion-height": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  16.5,
                  0,
                  17,
                  ["get", "height"],
                ],
                "fill-extrusion-base": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  16.5,
                  0,
                  17,
                  ["get", "min_height"],
                ],
                "fill-extrusion-opacity": 0.6,
              },
            },
            labelLayerId
          );
        });
      }
    })();

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !mapRef.current || !mapboxRef.current || pontos.length === 0) return;

    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;

    if (map.markers) map.markers.forEach((m) => m.remove());
    map.markers = [];

    ["rota"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource("rota")) map.removeSource("rota");

    setRotaInfo(null);
    if (filtro === "-") return;

    const pontosFiltrados = pontos.filter((p) => {
      switch (filtro) {
        case "Prioridade: Maxima":
          return p.Stats === "Cheia";
        case "Coleta Padrão":
          return p.Stats === "Cheia" || p.Stats === "Quase Cheia";
        case "Prioridade: Média":
          return p.Stats === "Quase Cheia";
        case "Prioridade: Baixa":
          return p.Stats === "Vazia";
        default:
          return false;
      }
    });

    pontosFiltrados.forEach((ponto) => {
      const { x, y } = ponto.Coordenadas;
      const color =
        ponto.Stats === "Vazia"
          ? "green"
          : ponto.Stats === "Quase Cheia"
            ? "orange"
            : "red";

      const el = document.createElement("div");
      Object.assign(el.style, {
        backgroundColor: color,
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        border: "3px solid white",
        boxShadow: "0 0 4px rgba(0,0,0,0.5)",
        cursor: "pointer",
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([x, y])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
    <div style="
      font-family: Arial, sans-serif;
      padding: 12px 14px;
      border-radius: 10px;
      background: white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      min-width: 180px;
    ">
      <div style="
        font-size: 16px;
        font-weight: 700;
        color: #333;
        margin-bottom: 6px;
      ">
        🗑️ Sensor ${ponto.ID}
      </div>

      <div style="
        font-size: 14px;
        color: #444;
        margin-bottom: 4px;
      ">
        <strong>Endereço:</strong><br/>
        <span style="color:#666">${ponto.Endereco}</span>
      </div>

      <div style="
        font-size: 14px;
        margin: 6px 0;
        padding: 6px 10px;
        background: ${ponto.Stats === "Vazia"
              ? "#d4f8d4"
              : ponto.Stats === "Quase Cheia"
                ? "#ffe9b3"
                : "#ffcdcd"
            };
        border-radius: 6px;
        font-weight: bold;
        color: #333;
        text-align: center;
      ">
        Status: ${ponto.Stats}
      </div>

      <div style="font-size: 12px; color:#777;">
        <strong>Lat:</strong> ${y}<br/>
        <strong>Lng:</strong> ${x}
      </div>
    </div>
  `)
        )

        .addTo(map);

      map.markers.push(marker);
    });

    if (pontosFiltrados.length >= 1) {
      const coords = [usuario, ...pontosFiltrados].map((p) => [
        p.x ?? p.Coordenadas.x,
        p.y ?? p.Coordenadas.y,
      ]);

      if (coords.length < 2) return;

      const optimizedUrl = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords
        .map((c) => c.join(","))
        .join(";")}?geometries=geojson&overview=full&source=first&roundtrip=false&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

      fetch(optimizedUrl)
        .then((res) => res.json())
        .then((data) => {
          if (!data.trips || !data.trips[0]) {
            const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords
              .map((c) => c.join(","))
              .join(";")}?geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
            return fetch(directionsUrl).then((res) => res.json());
          }
          return { trips: [data.trips[0]] };
        })
        .then((data) => {
          const route = data.trips
            ? data.trips[0].geometry
            : data.routes?.[0]?.geometry;

          const distance =
            data.trips?.[0]?.distance || data.routes?.[0]?.distance || 0;
          const duration =
            data.trips?.[0]?.duration || data.routes?.[0]?.duration || 0;

          if (!route) return;

          setRotaInfo({
            distance: (distance / 1000).toFixed(2),
            duration: (duration / 60).toFixed(1),
          });

          map.addSource("rota", {
            type: "geojson",
            data: { type: "Feature", geometry: route },
          });

          map.addLayer({
            id: "rota",
            type: "line",
            source: "rota",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#007BFF",
              "line-width": 6,
              "line-opacity": 0.9,
            },
          });
          const bounds = new mapboxgl.LngLatBounds();
          route.coordinates.forEach((coord) => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 50 });
        })
        .catch((err) => console.error("❌ Erro ao calcular rota:", err));
    }
  }, [filtro, pontos, mounted]);

  if (!mounted) return null;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 15,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          background: "white",
          borderRadius: "10px",
          padding: "10px 16px",
          boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
          fontFamily: "sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontWeight: 600,
        }}
      >
        <span className="text-black">Rota:</span>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            outline: "none",
            fontWeight: filtro === "Coleta Padrão" ? 700 : 500,
            color: filtro === "Coleta Padrão" ? "#007BFF" : "#333",
            boxShadow:
              filtro === "Coleta Padrão"
                ? "0 0 6px rgba(0,123,255,0.5)"
                : "none",
          }}
        >
          <option>-</option>
          <option>Coleta Padrão</option>
          <option>Prioridade: Maxima</option>
          <option>Prioridade: Média</option>
          <option>Prioridade: Baixa</option>
        </select>
      </div>

      {rotaInfo && (
        <div
          style={{
            position: "absolute",
            bottom: 15,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ffffffd9",
            padding: "10px 20px",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontFamily: "sans-serif",
            fontWeight: 600,
          }}
        >
        </div>
      )}

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
