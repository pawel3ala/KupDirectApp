import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios'
import { WebView } from 'react-native-webview';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ScreenOrientation } from 'expo';
import base64 from 'react-native-base64'
import * as Sentry from 'sentry-expo';
import ScannerScreen from "./screens/ScannerScreen"

Sentry.init({
  dsn: 'https://f8a02133e800455c86bee49793874e17@sentry.io/2581571',
  enableInExpoDevelopment: true,
  debug: true
});

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
        <Stack.Screen name="Oferta" component={Oferta} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Oferta(props) {

  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    })();
  }, []);

  return (
    <>
      <StatusBar hidden={true} />
      <WebView
        // scalesPageToFit
        // javaScriptEnabled
        // style={{ flex: 1 }}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          Sentry.captureMessage('WebView error: ' + nativeEvent, 'error');
        }}
        source={{ uri: `http://kup.direct/appconnect/service.php?session=${props.route.params.sessionId}` }}
      />
    </>
  );
}

// http://kup.direct/appconnect/service.php?session=1d1fd1457dee2864fb36c76d6fdbc2e5769f0f2f
