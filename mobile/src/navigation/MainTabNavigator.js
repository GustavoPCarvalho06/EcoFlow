// =================================================================================
// Arquivo: mobile/src/navigation/MainTabNavigator.js
// =================================================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';

import HomeScreen from '../screens/HomeScreen';
import ComunicadosScreen from '../screens/ComunicadosScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Importação nova

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { comunicadoCount, msgCount } = useNotification();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#28a745',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Mapa') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Comunicados') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Mensagens') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Mapa" component={HomeScreen} options={{ title: 'Mapa de Coleta' }} />
      
      <Tab.Screen 
        name="Comunicados" 
        component={ComunicadosScreen} 
        options={{ 
          title: 'Mural',
          tabBarBadge: comunicadoCount > 0 ? comunicadoCount : null,
          tabBarBadgeStyle: { backgroundColor: '#ef4444', color: 'white', fontSize: 11 }
        }} 
      />
      
      <Tab.Screen 
        name="Mensagens" 
        component={MessagesScreen} 
        options={{ 
          title: 'Chat',
          tabBarBadge: msgCount > 0 ? msgCount : null,
          tabBarBadgeStyle: { backgroundColor: '#ef4444', color: 'white', fontSize: 11 }
        }} 
      />

      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ 
          title: 'Meu Perfil',
          headerShown: false // A tela de perfil tem seu próprio header personalizado
        }} 
      />
    </Tab.Navigator>
  );
}