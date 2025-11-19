import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { NotificationProvider } from './src/context/NotificationContext';

import LoginScreen from "./src/screens/LoginScreen";
import MainTabNavigator from './src/navigation/MainTabNavigator';
import ChatDetailScreen from './src/screens/ChatDetailScreen'; // <--- IMPORTAR

const Stack = createStackNavigator();

export default function App() {
  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          /> 
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator}
            options={{ headerShown: false }} 
          />
          {/* Tela de Chat (Fica "em cima" das abas) */}
          <Stack.Screen 
            name="ChatDetail" 
            component={ChatDetailScreen}
            options={{ title: 'Conversa' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
}