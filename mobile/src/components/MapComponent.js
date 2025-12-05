import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Platform, PermissionsAndroid } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { filtrarPontos, routeToLatLngArray } from "../components/mapLogic";

export default function MapComponent({ apiUrl, mapboxToken }) {
  const [pontos, setPontos] = useState([]);
  const [filtro, setFiltro] = useState("-");
  const [routeCoords, setRouteCoords] = useState([]);
  const [usuario, setUsuario] = useState({ latitude: -23.64434, longitude: -46.559689 });
  const mapRef = useRef(null);

  async function requestLocationPermission() {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUsuario({ latitude, longitude });
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );
          }
        },
        error => console.error("Erro ao obter localização:", error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })();
  }, []);

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

  const pontosFiltrados = filtro === "-" ? pontos : filtrarPontos(pontos, filtro);

  async function calcularRota() {
    if (!mapboxToken || pontosFiltrados.length === 0) {
      setRouteCoords([]);
      return;
    }

    const coords = [
      [usuario.longitude, usuario.latitude],
      ...pontosFiltrados.map(p => [
        Number(p.Coordenadas?.x ?? p.x),
        Number(p.Coordenadas?.y ?? p.y),
      ]),
    ];

    try {
      let resp = await fetch(
        `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords
          .map(c => c.join(","))
          .join(";")}?geometries=geojson&overview=full&source=first&roundtrip=false&access_token=${mapboxToken}`
      );
      let json = await resp.json();

      if (!json.trips || !json.trips.length) {
        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords
          .map(c => c.join(","))
          .join(";")}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
        resp = await fetch(directionsUrl);
        json = await resp.json();
      }

      const geometry = json.trips?.[0]?.geometry || json.routes?.[0]?.geometry;
      if (!geometry) {
        setRouteCoords([]);
        return;
      }

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

  useEffect(() => {
    calcularRota();
  }, [filtro, pontos, usuario]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: usuario.latitude,
          longitude: usuario.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker coordinate={usuario} title="Você está aqui" pinColor="blue" />

        {pontosFiltrados.map(p => {
          const lat = Number(p.Coordenadas?.y ?? p.y);
          const lng = Number(p.Coordenadas?.x ?? p.x);
          const color =
            p.Stats === "Vazia"
              ? "green"
              : p.Stats === "Quase Cheia"
              ? "orange"
              : "red";

          return (
            <Marker key={p.ID} coordinate={{ latitude: lat, longitude: lng }} pinColor={color}>
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>🗑️ Sensor {p.ID}</Text>
                  <Text style={styles.calloutAddress}>{p.Endereco}</Text>

                  <View
                    style={[
                      styles.calloutStatus,
                      {
                        backgroundColor:
                          p.Stats === "Vazia"
                            ? "#d4f8d4"
                            : p.Stats === "Quase Cheia"
                            ? "#ffe9b3"
                            : "#ffcdcd",
                      },
                    ]}
                  >
                    <Text style={styles.calloutStatusText}>Status: {p.Stats}</Text>
                    <Text>Lat: {lat.toFixed(6)}</Text>
                    <Text>Lng: {lng.toFixed(6)}</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={5} lineJoin="round" strokeColor="#007BFF" />
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
  calloutContainer: {
    width: 220,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  calloutAddress: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  calloutStatus: {
    padding: 6,
    borderRadius: 6,
  },
  calloutStatusText: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#333",
  },
});