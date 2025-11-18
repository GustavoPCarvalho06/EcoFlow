// =================================================================================
// Arquivo: C:\...\EcoFlow\mobliler\src\screens\MapComponent.js
// =================================================================================

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

// !! IMPORTANTE !! Substitua pelo IP do seu backend.
const API_URL = 'http://10.84.6.136:3001'; 

// !! IMPORTANTE !! Substitua pela sua chave pública do Mapbox.
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2FjYWJhbWJhc3BpcyIsImEiOiJjbWdxaDM5NHIycGxzMm1vZTk4c3oyZjI0In0.9FObgQi-9a8oDwxuEH0SrA'; // <-- COLOQUE SEU TOKEN DO MAPBOX AQUI


export default function MapComponent() {
  const [location, setLocation] = useState(null);
  const [lixeiras, setLixeiras] = useState([]);
  const [filteredLixeiras, setFilteredLixeiras] = useState([]);
  const [activeFilter, setActiveFilter] = useState('cheias'); // Filtro inicial
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null);

  const initialize = async () => {
    console.log("--- Iniciando o Mapa ---");
    setIsLoading(true);
    setErrorMsg(null);
    try {
      console.log("1. Pedindo permissão de localização...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error("Permissão negada!");
        setErrorMsg('Permissão de localização negada. Habilite nas configurações do app Expo Go.');
        setIsLoading(false);
        return;
      }
      console.log("Permissão concedida.");

      console.log("2. Obtendo localização atual...");
      let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(currentLocation.coords);
      console.log("Localização obtida:", currentLocation.coords.latitude, currentLocation.coords.longitude);

      console.log(`3. Buscando lixeiras da API em ${API_URL}/statusSensor ...`);
      const response = await fetch(`${API_URL}/statusSensor`);
      if (!response.ok) {
        throw new Error(`Falha ao buscar pontos de coleta. Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Dados recebidos da API:", JSON.stringify(data, null, 2)); // Log completo dos dados
      
      if (!Array.isArray(data)) {
          throw new Error("Formato de dados da API inesperado. Não é um array.");
      }
      
      setLixeiras(data);
      console.log("4. Lixeiras salvas no estado.");

    } catch (error) {
      console.error("ERRO na inicialização:", error);
      setErrorMsg(error.message || 'Ocorreu um erro ao carregar o mapa.');
    } finally {
      console.log("5. Finalizando o loading.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);
  
  useEffect(() => {
    if (!lixeiras.length || !location) return;

    let tempFiltered = [];
    if (activeFilter === 'cheias') {
        tempFiltered = lixeiras.filter(l => l.Stats === 'Cheia');
    } else if (activeFilter === 'quaseCheias') {
        tempFiltered = lixeiras.filter(l => l.Stats === 'Quase Cheia');
    } else if (activeFilter === 'vazias') {
        tempFiltered = lixeiras.filter(l => l.Stats === 'Vazia');
    }
    setFilteredLixeiras(tempFiltered);

    if (tempFiltered.length > 0) {
        fetchRoute(tempFiltered);
    } else {
        setRouteCoordinates([]); 
    }
  }, [activeFilter, lixeiras, location]);
  
  const fetchRoute = async (points) => {
    const userCoords = `${location.longitude},${location.latitude}`;
    const pointsCoords = points.map(p => `${p.Coordenadas.x},${p.Coordenadas.y}`).join(';');
    const coordinatesString = `${userCoords};${pointsCoords}`;
    
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0].geometry.coordinates.map(coord => ({
                latitude: coord[1],
                longitude: coord[0],
            }));
            setRouteCoordinates(route);
        }
    } catch (error) {
        console.error("Erro ao calcular rota:", error);
    }
  };

  const getPinColor = (status) => {
    switch (status) {
      case 'Cheia': return 'red';
      case 'Quase Cheia': return 'orange';
      case 'Vazia': return 'green';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.infoText}>Carregando mapa e localização...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar:</Text>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Button title="Tentar Novamente" onPress={initialize} color="#28a745" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsUserLocation={true}
      >
        {filteredLixeiras.map(lixeira => (
          <Marker
            key={lixeira.ID}
            coordinate={{ latitude: lixeira.Coordenadas.y, longitude: lixeira.Coordenadas.x }}
            title={`Lixeira #${lixeira.ID}`}
            description={`Status: ${lixeira.Stats}`}
            pinColor={getPinColor(lixeira.Stats)}
          />
        ))}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007bff"
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'cheias' && styles.activeFilter]}
          onPress={() => setActiveFilter('cheias')}>
          <Text style={styles.filterText}>Cheias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'quaseCheias' && styles.activeFilter]}
          onPress={() => setActiveFilter('quaseCheias')}>
          <Text style={styles.filterText}>Quase Cheias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'vazias' && styles.activeFilter]}
          onPress={() => setActiveFilter('vazias')}>
          <Text style={styles.filterText}>Vazias</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    flex: 1 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  infoText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#333' 
  },
  errorText: { 
    marginBottom: 15, 
    fontSize: 16, 
    color: 'red', 
    textAlign: 'center' 
  },
  filterContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  activeFilter: {
    backgroundColor: '#28a745',
  },
  filterText: {
    fontWeight: 'bold',
    color: '#333',
  },
});