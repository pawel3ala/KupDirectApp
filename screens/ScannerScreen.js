import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Vibration
} from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios'
import base64 from 'react-native-base64'
import { Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import NoCameraPermissionScreen from './NoCameraPermissionScreen';
import WebViewErrorScreen from './WebViewErrorScreen'
import LoadingScreen from './LoadingScreen';
import * as Sentry from 'sentry-expo';
import { __SENTRY_DNS__, __ENDPOINT__ } from 'react-native-dotenv'
import BarcodeMask from 'react-native-barcode-mask';
import { useFocusEffect } from '@react-navigation/native'

Sentry.init({
    dsn: __SENTRY_DNS__,
    enableInExpoDevelopment: true,
    debug: true
});

const SCREEN_WIDTH = Dimensions.get('window').width

export default function ScannerScreen({ navigation }) {

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setScanned(false);
        }, [])
      );

    useEffect(() => {
        async function getPermissions() {
            const { status } = await Camera.requestPermissionsAsync();

            if (status === 'granted') {
                setHasPermission(true);
            }
            else {
                Sentry.captureMessage('Permision to use Camera has not been granted!', 'error');
                setHasPermission(false);
            }
        }
        getPermissions();
    }, []);

    const handleBarCodeScanned = ({ data }) => {
        setScanned(true);
        Sentry.captureMessage('Aztec code succesfully scanned', 'info');

        let formData = new FormData()
        formData.append('action', 'datatransfer')
        formData.append('terminal', '99999999YYYYYYYY')
        formData.append('barcode', base64.encode(data))

        axios.post(__ENDPOINT__, formData)
            .then((resp) => getSessionId(resp.request._response))
            .then((session) => {
                Vibration.vibrate()
                navigation.navigate('OffersScreen', { sessionId: session })
            })
            .catch((error) => {
                Sentry.captureMessage('Aztec code succesfully scanned but server responded with:' + JSON.stringify(error), 'fatal');
            })
    };

    const returnRequestForCamera = () => {
        return <View style={{ backgroundColor: '"#f08032' }} />
    }

    if (hasPermission === null) return returnRequestForCamera();
    if (hasPermission === false) return <NoCameraPermissionScreen />

    return (
        <View style={{
            flex: 1,
            flexDirection: 'row'
        }}>
            <WebView
                scalesPageToFit
                style={{ flex: 1 }}
                onError={syntheticEvent => {
                    const { nativeEvent } = syntheticEvent;
                    Sentry.captureMessage('WebView error on ScannerScreen: ' + JSON.stringify(nativeEvent), 'error');
                }}
                renderError={() => <WebViewErrorScreen />}
                renderLoading={() => <LoadingScreen />}
                source={{ uri: `${__ENDPOINT__}page_scan` }}
            />
            <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
                <StatusBar hidden={true} />
                <Camera
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barCodeScannerSettings={{ barCodeTypes: [BarCodeScanner.Constants.BarCodeType.aztec] }}
                    autoFocus={Camera.Constants.on}
                    style={StyleSheet.absoluteFillObject}
                    focusDepth={1} // initial camera focus as close as possible
                    whiteBalance={Camera.Constants.WhiteBalance.auto}
                    onMountError={(error) => Sentry.captureMessage('Camera onMountError' + JSON.stringify(error), 'error')}
                >
                    <BarcodeMask
                        width={250}
                        height={250}
                        edgeColor="white"
                        showAnimatedLine={false}
                        outerMaskOpacity={0.2}
                    />
                </Camera>
            </View>
        </View>
    );
}

const getSessionId = (string) => {
    /*
    Server returns a string, not a json object!
  
    Extracts session id from the folowing string:
    '{"status":"ok","message":"Dane zosta\u0142y przes\u0142ane na serwer i poprawnie zinterpretowane.","url":"http:__?service.php?session=cefd60ec5e49f83ab83d3fc2b615b863b0238886"}'
  
    returns 'cefd60ec5e49f83ab83d3fc2b615b863b0238886'
    */

    const indexOfEqualSign = string.lastIndexOf('=') + 1
    const indexOfLastQuotes = string.lastIndexOf('"')
    return string.slice(indexOfEqualSign, indexOfLastQuotes)
}
