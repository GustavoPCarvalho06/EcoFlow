import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Importando as telas e a nova estrutura de gaveta
import LoginScreen from "./src/screens/LoginScreen";
import AppDrawer from './src/navigation/AppDrawer';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        /> 
        {/* A tela "AppDrawer" agora contém toda a navegação pós-login */}
        <Stack.Screen 
          name="AppDrawer" 
          component={AppDrawer}
          options={{ headerShown: false }} // Esconde o header do Stack, pois o Drawer já tem o seu
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}