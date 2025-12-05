// mobile/src/components/MapComponent.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { filtrarPontos, routeToLatLngArray } from "../components/mapLogic";

const usuario = { latitude: -23.64434, longitude: -46.559689 };

export default function MapComponent({ apiUrl, mapboxToken }) {
  const [pontos, setPontos] = useState([]);
  const [filtro, setFiltro] = useState("-"); 
  const [routeCoords, setRouteCoords] = useState([]);
  const mapRef = useRef(null);

  // Fetch sensor points
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/statusSensor`);
        const data = await res.json();
        setPontos(data || []);
      } catch (err) {
        console.error("Erro fetch pontos:", err);
      }
    })();
  }, [apiUrl]);

  // Fix: use all points when filter is "-"
  const pontosFiltrados = filtro === "-" ? pontos : filtrarPontos(pontos, filtro);

  // Calculate route using Mapbox
  async function calcularRota() {
    if (!mapboxToken) {
      console.warn("Mapbox token missing");
      return;
    }

    if (pontosFiltrados.length === 0) {
      setRouteCoords([]);
      return;
    }

    const coords = [
      [usuario.longitude, usuario.latitude],
      ...pontosFiltrados.map(p => [
        p.Coordenadas?.x ?? p.x,
        p.Coordenadas?.y ?? p.y
      ])
    ];

    const optimizedUrl = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords
      .map(c => c.join(","))
      .join(";")}?geometries=geojson&overview=full&roundtrip=false&source=first&access_token=${mapboxToken}`;

    try {
      const resp = await fetch(optimizedUrl);
      const json = await resp.json();
      console.log("Mapbox response:", json); // Debugging

      if (!json.trips || !json.trips.length) {
        console.warn("Mapbox optimized-trips did not return a route");
        setRouteCoords([]);
        return;
      }

      const geometry = json.trips[0].geometry;
      const latLngArray = routeToLatLngArray(geometry);
      setRouteCoords(latLngArray);

      if (mapRef.current && latLngArray.length) {
        const mid = latLngArray[Math.floor(latLngArray.length / 2)];
        mapRef.current.animateToRegion(
          {
            latitude: mid.latitude,
            longitude: mid.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          800
        );
      }
    } catch (err) {
      console.error("Erro ao calcular rota:", err);
    }
  }

  // Recalculate route whenever points or filter changes
  useEffect(() => {
    calcularRota();
  }, [filtro, pontos]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: usuario.latitude,
          longitude: usuario.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={true}
      >
        <Marker coordinate={usuario} title="Você está aqui" pinColor="blue" />

        {pontosFiltrados.map(p => {
          const lat = p.Coordenadas?.y ?? p.y;
          const lng = p.Coordenadas?.x ?? p.x;
          const color =
            p.Stats === "Vazia"
              ? "green"
              : p.Stats === "Quase Cheia"
              ? "orange"
              : "red";

          return (
            <Marker key={p.ID} coordinate={{ latitude: lat, longitude: lng }} pinColor={color}>
              <Callout>
                <View style={{ width: 220 }}>
                  <Text style={{ fontWeight: "700" }}>🗑️ Sensor {p.ID}</Text>
                  <Text numberOfLines={2}>{p.Endereco}</Text>
                  <View
                    style={{
                      marginTop: 6,
                      padding: 6,
                      borderRadius: 6,
                      backgroundColor:
                        p.Stats === "Vazia"
                          ? "#d4f8d4"
                          : p.Stats === "Quase Cheia"
                          ? "#ffe9b3"
                          : "#ffcdcd",
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>Status: {p.Stats}</Text>
                    <Text>Lat: {lat.toFixed(6)}</Text>
                    <Text>Lng: {lng.toFixed(6)}</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={5} lineJoin="round" />
        )}
      </MapView>

      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filtro}
          onValueChange={value => setFiltro(value)}
          style={styles.picker}
          itemStyle={{ height: 44 }}
        >
          <Picker.Item label="-" value="-" />
          <Picker.Item label="Coleta Padrão" value="Coleta Padrão" />
          <Picker.Item label="Prioridade: Maxima" value="Prioridade: Maxima" />
          <Picker.Item label="Prioridade: Média" value="Prioridade: Média" />
          <Picker.Item label="Prioridade: Baixa" value="Prioridade: Baixa" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  filterContainer: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: "hidden",
  },
  picker: {
    width: Platform.OS === "ios" ? 220 : 200,
    height: 44,
  },
});
