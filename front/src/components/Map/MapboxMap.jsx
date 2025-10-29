"use client";

import React, { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_STYLES } from "./mapStyles.js";

export default function MapboxMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const mapboxRef = useRef(null);
  const [filtro, setFiltro] = useState("-");
  const [pontos, setPontos] = useState([]);

  const usuario = { x: -46.559689, y: -23.644340 };

  // busca pontos
  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:3001/statusSensor");
      const data = await response.json();
      setPontos(data);
    })();
  }, []);

  // Cria o mapa
  useEffect(() => {
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
        });

        mapRef.current = map;

        map.addControl(new mapboxgl.NavigationControl());

        // Cria marcador do usuário
        const UsuarioMarker = document.createElement("div");
        UsuarioMarker.className = "marker";
        UsuarioMarker.style.backgroundImage = "url('https://i.imgur.com/MK4NUzI.png')";
        UsuarioMarker.style.width = "32px";
        UsuarioMarker.style.height = "40px";

        new mapboxgl.Marker(UsuarioMarker)
          .setLngLat([usuario.x, usuario.y])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("Você está aqui"))
          .addTo(mapRef.current);
      }
    })();

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // atualiza dps dos filtro
  useEffect(() => {
    if (!mapRef.current || !mapboxRef.current || pontos.length === 0) return;

    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;

    // remove pontos anteriores
    if (map.markers) map.markers.forEach((m) => m.remove());
    map.markers = [];

    // remove rota anterior
    if (map.getLayer("rota")) map.removeLayer("rota");
    if (map.getSource("rota")) map.removeSource("rota");

    // filtra pontos
    let pontosFiltrados = pontos;
    if (filtro !== "-" && filtro !== "Todas") {
      pontosFiltrados = pontos.filter((p) => {
        if (filtro === "Cheias") return p.Stats === "Cheia";
        if (filtro === "Meio Cheias") return p.Stats === "Quase Cheia";
        if (filtro === "Vazias") return p.Stats === "Vazia";
      });
    }

    let pontosParaMostrar = filtro === "-" ? pontos : pontosFiltrados;

    // adiciona marcadores
    pontosParaMostrar.forEach((ponto) => {
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

      const marker = new mapboxgl.Marker(el)
        .setLngLat([x, y])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <strong>ID:</strong> ${ponto.ID}<br/>
            <strong>Status:</strong> ${ponto.Stats}<br/>
            <strong>Lat:</strong> ${y}<br/>
            <strong>Lng:</strong> ${x}
          `)
        )
        .addTo(map);

      map.markers.push(marker);
    });

    // cria rota azul
    if (filtro !== "-" && pontosFiltrados.length >= 1) {
      const coords = [usuario, ...pontosFiltrados].map((p) => [
        p.x ?? p.Coordenadas.x,
        p.y ?? p.Coordenadas.y,
      ]);

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords
        .map((c) => c.join(","))
        .join(";")}?geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

      fetch(directionsUrl)
        .then((res) => res.json())
        .then((routeData) => {
          if (routeData.routes && routeData.routes[0]) {
            const route = routeData.routes[0].geometry;

            map.addSource("rota", {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: route,
              },
            });

            map.addLayer({
              id: "rota",
              type: "line",
              source: "rota",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#007BFF",
                "line-width": 4,
              },
            });

            const bounds = new mapboxgl.LngLatBounds();
            route.coordinates.forEach((coord) => bounds.extend(coord));
            map.fitBounds(bounds, { padding: 50 });
          }
        });
    }
  }, [filtro, pontos]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 15,
          zIndex: 10,
          background: "white",
          borderRadius: "8px",
          padding: "8px 12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          fontFamily: "sans-serif",
        }}
      >
        <label style={{ marginRight: "8px", fontWeight: 600 }}>Filtrar rota:</label>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            padding: "4px 8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option>-</option>
          <option>Todas</option>
          <option>Cheias</option>
          <option>Meio Cheias</option>
          <option>Vazias</option>
        </select>
      </div>

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "800px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}