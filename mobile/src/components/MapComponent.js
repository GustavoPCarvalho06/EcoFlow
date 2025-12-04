// mobile/src/components/MapComponent.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Picker } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { filtrarPontos, routeToLatLngArray } from "../components/mapLogic";

const usuario = { latitude: -23.64434, longitude: -46.559689 };

export default function MapComponent({ apiUrl, mapboxToken, onCreatePoint }) {
  const [pontos, setPontos] = useState([]);
  const [filtro, setFiltro] = useState("-");
  const [routeCoords, setRouteCoords] = useState([]);
  const mapRef = useRef(null);

  // fetch pontos
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

  const pontosFiltrados = filtro === "-" ? [] : filtrarPontos(pontos, filtro);

  // calculate route using Mapbox optimized trips or directions
  async function calcularRota() {
    if (!mapboxToken) {
      console.warn("Mapbox token missing");
      return;
    }
    if (pontosFiltrados.length === 0) {
      setRouteCoords([]);
      return;
    }

    // coords: [lng,lat] pairs: start is usuario then pontos
    const coords = [ [usuario.longitude, usuario.latitude], 
      ...pontosFiltrados.map(p => [p.Coordenadas.x, p.Coordenadas.y])
    ];

    const optimizedUrl = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords.map(c=>c.join(',')).join(';')}?geometries=geojson&overview=full&roundtrip=false&source=first&access_token=${mapboxToken}`;

    try {
      let resp = await fetch(optimizedUrl);
      let json = await resp.json();

      if (!json.trips || !json.trips.length) {
        // fallback to directions (non-optimized)
        const dirUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords.map(c=>c.join(',')).join(';')}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
        resp = await fetch(dirUrl);
        json = await resp.json();
      }

      const geometry = json.trips?.[0]?.geometry || json.routes?.[0]?.geometry;
      if (!geometry) {
        console.warn("No route geometry returned");
        return;
      }
      const latLngArray = routeToLatLngArray(geometry);
      setRouteCoords(latLngArray);

      // fit to coordinates
      if (mapRef.current && latLngArray.length) {
        const { latitude, longitude } = latLngArray[Math.floor(latLngArray.length / 2)] || usuario;
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        }, 800);
      }
    } catch (err) {
      console.error("Erro ao calcular rota:", err);
    }
  }

  // call calcularRota whenever filtro changes
  useEffect(() => {
    calcularRota();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, pontos]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE} // remove this if you want Apple maps on iOS
        initialRegion={{
          latitude: usuario.latitude,
          longitude: usuario.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        onPress={(e) => {
          const { coordinate } = e.nativeEvent;
          if (onCreatePoint) onCreatePoint(coordinate);
        }}
        showsUserLocation={true}
      >
        {/* user marker */}
        <Marker
          coordinate={usuario}
          title="Você está aqui"
          pinColor="blue"
        />

        {/* sensor markers */}
        {pontosFiltrados.map(p => {
          const lat = p.Coordenadas.y ?? p.y;
          const lng = p.Coordenadas.x ?? p.x;
          const color = p.Stats === "Vazia" ? "green" : p.Stats === "Quase Cheia" ? "orange" : "red";
          return (
            <Marker
              key={p.ID}
              coordinate={{ latitude: lat, longitude: lng }}
              pinColor={color}
            >
              <Callout>
                <View style={{ width: 220 }}>
                  <Text style={{ fontWeight: "700" }}>🗑️ Sensor {p.ID}</Text>
                  <Text numberOfLines={2}>{p.Endereco}</Text>
                  <View style={{ marginTop: 6, padding: 6, borderRadius: 6, backgroundColor: p.Stats === "Vazia" ? "#d4f8d4" : p.Stats === "Quase Cheia" ? "#ffe9b3" : "#ffcdcd" }}>
                    <Text style={{ fontWeight: "700" }}>Status: {p.Stats}</Text>
                    <Text>Lat: {lat.toFixed(6)}</Text>
                    <Text>Lng: {lng.toFixed(6)}</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {/* route as polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            lineJoin="round"
          />
        )}
      </MapView>

      {/* Floating filter control */}
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filtro}
          onValueChange={(value) => setFiltro(value)}
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
    overflow: "hidden"
  },
  picker: {
    width: Platform.OS === "ios" ? 220 : 200,
    height: 44
  }
});
