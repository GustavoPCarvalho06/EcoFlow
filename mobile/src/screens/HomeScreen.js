// mobile/src/screens/MapaScreen.js
import React, { useState } from "react";
import { View, Modal, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapComponent from "../components/MapComponent";

const API_URL = "http://10.0.2.2:3001";
const MAPBOX_TOKEN = "pk.eyJ1Ijoic2FjYWJhbWJhc3BpcyIsImEiOiJjbWdxaDM5NHIycGxzMm1vZTk4c3oyZjI0In0.9FObgQi-9a8oDwxuEH0SrA";

export default function MapaScreen() {
  const [createCoord, setCreateCoord] = useState(null);

  async function handleCreatePoint(coord) {
    // coord = { latitude, longitude }
    // show modal to confirm and POST to your API or open a form
    setCreateCoord(coord);
  }

  async function submitNewPoint(data) {
    // call your API to create new point
    // await fetch(`${API_URL}/createPoint`, { method: "POST", body: JSON.stringify(data) })
    setCreateCoord(null);
  }

  return (
    <View style={{ flex: 1 }}>
      <MapComponent
        apiUrl={API_URL}
        mapboxToken={MAPBOX_TOKEN}
        onCreatePoint={handleCreatePoint}
      />

      <Modal visible={!!createCoord} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Criar novo ponto</Text>
            <Text>Lat: {createCoord?.latitude?.toFixed(6)}</Text>
            <Text>Lng: {createCoord?.longitude?.toFixed(6)}</Text>

            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <TouchableOpacity style={styles.btn} onPress={() => setCreateCoord(null)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: "#0a84ff" }]} onPress={() => submitNewPoint({ lat: createCoord.latitude, lng: createCoord.longitude })}>
                <Text style={{ color: "white" }}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000066" },
  modal: { width: 320, backgroundColor: "white", padding: 20, borderRadius: 12 },
  btn: { padding: 10, marginRight: 8, borderRadius: 8, backgroundColor: "#eee" }
});
