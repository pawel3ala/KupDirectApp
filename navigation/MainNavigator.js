import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from '../screens/ScannerScreen'
import OffersScreen from '../screens/OffersScreen'

const Stack = createStackNavigator();

export default function MainNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="ScannerScreen"
        >
            <Stack.Screen name="OffersScreen" component={OffersScreen} />
            <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
        </Stack.Navigator>
    );
}
