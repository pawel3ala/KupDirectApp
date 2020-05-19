import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from '../screens/ScannerScreen'
import OffersScreen from '../screens/OffersScreen'
import InitialScreen from '../screens/InitialScreen'

const Stack = createStackNavigator();

export default function MainNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: false
            }}
            initialRouteName="InitialScreen"
        >
            <Stack.Screen name="InitialScreen" component={InitialScreen} />
            <Stack.Screen name="OffersScreen" component={OffersScreen} />
            <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
        </Stack.Navigator>
    );
}
