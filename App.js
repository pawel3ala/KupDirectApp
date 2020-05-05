import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from "./screens/ScannerScreen"
import OffersScreen from "./screens/OffersScreen"

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="ScannerScreen"
      >
          <Stack.Screen name="OffersScreen" component={OffersScreen} />
          <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}