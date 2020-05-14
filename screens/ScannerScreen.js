import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Platform,
    Button
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

Sentry.init({
    dsn: 'https://f8a02133e800455c86bee49793874e17@sentry.io/2581571',
    enableInExpoDevelopment: true,
    debug: true
});

export default function ScannerScreen({ navigation }) {

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

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
            .then((session) => {
                setScanned(false);
                navigation.navigate('OffersScreen', { sessionId: session })
            })
            .catch((error) => {
                Sentry.captureMessage('Aztec code succesfully scanned but server responded with:' + error, 'fatal');
            })
    };

    const returnRequestForCamera = () => {
        return <View style={{ backgroundColor: '"#f08032' }} />
    }

    const returnOverlayedComponent = () => {
        return (
            <View style={styles.overlay}>
                <View style={styles.unfocusedContainer} />
                <View style={styles.middleContainer}>
                    <View style={styles.unfocusedContainer} />
                    <View style={styles.focusedContainer} />
                    <View style={styles.unfocusedContainer} />
                </View>
                <View style={styles.unfocusedContainer} />
            </View>
        )
    }

    if (hasPermission === null) {
        return returnRequestForCamera();
    }
    if (hasPermission === false) {
        return <NoCameraPermissionScreen />
    }

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
                    Sentry.captureMessage('WebView error on ScannerScreen: ' + nativeEvent, 'error');
                }}
                renderError={() => <WebViewErrorScreen />}
                renderLoading={() => <LoadingScreen />}
                source={{ uri: 'http://kup.direct/appconnect/service.php?page_scan' }}
            />
            <View style={{ width: Dimensions.get('window').height }}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                    }}>
                    <StatusBar hidden={true} />
                    <Camera
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barCodeScannerSettings={{ barCodeTypes: [BarCodeScanner.Constants.BarCodeType.aztec] }}
                        autoFocus={Camera.Constants.on}
                        style={StyleSheet.absoluteFillObject}
                        focusDepth={1} // initial camera focus as close as possible
                        whiteBalance={Camera.Constants.WhiteBalance.auto}
                        onMountError={(error) => Sentry.captureMessage('Camera onMountError' + error, 'error')}
                    />
                    {returnOverlayedComponent()}
                </View>
            </View>
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
        flex: 2,
    },
    focusedContainer: {
        width: '60%',
        height: '70%'
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