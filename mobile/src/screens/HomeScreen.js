import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapComponent from '../components/MapComponent';

export default function HomeScreen() {
  const apiUrl = "http://10.0.2.2:3001";
  const mapboxToken = 'pk.eyJ1Ijoic2FjYWJhbWJhc3BpcyIsImEiOiJjbWdxaDM5NHIycGxzMm1vZTk4c3oyZjI0In0.9FObgQi-9a8oDwxuEH0SrA';

  return (
    <View style={styles.container}>
      <MapComponent apiUrl={apiUrl} mapboxToken={mapboxToken} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
