import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={80} color="#28a745" />
      <Text style={styles.title}>Mapa em Desenvolvimento</Text>
      <Text style={styles.subtitle}>
        A funcionalidade de rotas e geolocalização estará disponível em breve.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 20, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 }
});