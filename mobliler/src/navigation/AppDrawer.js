import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons'; // Usaremos ícones para a sidebar

// Importe as telas que farão parte da gaveta
import HomeScreen from '../screens/HomeScreen';
import ComunicadosScreen from '../screens/ComunicadosScreen';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#28a745', // Cor do item ativo
        drawerLabelStyle: { marginLeft: -20 }, // Ajuste para alinhar com o ícone
      }}
    >
      <Drawer.Screen 
        name="Mapa" 
        component={HomeScreen} 
        options={{ 
          title: 'Mapa de Coleta',
          drawerIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="Comunicados" 
        component={ComunicadosScreen} 
        options={{
          title: 'Mural de Comunicados',
          drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" size={size} color={color} />
        }}
      />
    </Drawer.Navigator>
  );
}