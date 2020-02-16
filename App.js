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

Sentry.init({
  dsn: 'https://f8a02133e800455c86bee49793874e17@sentry.io/2581571',
  enableInExpoDevelopment: true,
  debug: true
});

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Oferta" component={Oferta} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;


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
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          Sentry.captureMessage('WebView error: ' + nativeEvent, 'error');
        }}
        source={{ uri: `http://kup.diect/appconnect/service.php?session=${props.route.params.sessionId}` }}
      />
    </>
  );
}


// http://kup.direct/appconnect/service.php?session=1d1fd1457dee2864fb36c76d6fdbc2e5769f0f2f
function HomeScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();

      if (status === 'granted') {
        setHasPermission(true);
      }
      else {
        Sentry.captureMessage('Permision to use Camera has not been granted!', 'error');
        setHasPermission(false);
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Dobra, udalo sie zeskanowac`);
    Sentry.captureMessage('Aztec code succesfully scanned', 'info');

    let formData = new FormData()
    formData.append("action", "datatransfer")
    formData.append("terminal", "99999999YYYYYYYY")
    formData.append("barcode", base64.encode(data))

    let config = {
      headers: {
        "HTTP_USER_AGENT": Platform.OS === 'ios' ? "KUPDIRECT_APP_IPHONE" : "KUPDIRECT_APP_ANDROID",
      }
    }

    axios.post("http://kup.direct/appconnect/service.php", formData, config)
      .then((resp) => getSessionId(resp.request._response))
      .then((session) => navigation.navigate('Oferta', { sessionId: session }))
      .catch((error) => {
        Sentry.captureMessage('Aztec code succesfully scanned but server responded with:' + error, 'fatal');
      })
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}>
      <StatusBar hidden={true} />
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.aztec]}
        autoFocus={true}
        videoStabilizationMode={"auto"}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View
            style={styles.focusedContainer}>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}></View>
      </View>
      {/* {scanned && <Button title={'Nacisnij zeby przeskanowac ponownie'} onPress={() => setScanned(false)} />} */}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 6,
  },
  rescanIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const getSessionId = (string) => {
  /*
  Server returns a string, not a json object!

  Extracts session id from the folowing string:
  '{"status":"ok","message":"Dane zosta\u0142y przes\u0142ane na serwer i poprawnie zinterpretowane.","url":"http:\/\/kup.direct\/appconnect\/service.php?session=cefd60ec5e49f83ab83d3fc2b615b863b0238886"}'

  returns 'cefd60ec5e49f83ab83d3fc2b615b863b0238886'
  */

  const indexOfEqualSign = string.lastIndexOf('=') + 1
  const indexOfLastQuotes = string.lastIndexOf('"')
  return string.slice(indexOfEqualSign, indexOfLastQuotes)
}