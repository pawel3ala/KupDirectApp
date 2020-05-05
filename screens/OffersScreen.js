import React from 'react';
import { StatusBar } from 'react-native'
import { WebView } from 'react-native-webview';
import { ScreenOrientation } from 'expo';
import * as Sentry from 'sentry-expo';
import { useFocusEffect } from '@react-navigation/native';

Sentry.init({
    dsn: 'https://f8a02133e800455c86bee49793874e17@sentry.io/2581571',
    enableInExpoDevelopment: true,
    debug: true
});

export default function Offers(props) {

    const { sessionId } = props.route.params

    async function rotateScreen() {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    async function restoreScreen() {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }

    useFocusEffect(
        React.useCallback(() => {
            // rotateScreen()
            // return () => {
            //     restoreScreen()
            // }
        })
    )

    return (
        <>
            <StatusBar hidden={true} />
            <WebView
                // scalesPageToFit
                javaScriptEnabled
                style={{ flex: 1 }}
                onError={syntheticEvent => {
                    const { nativeEvent } = syntheticEvent;
                    Sentry.captureMessage('WebView error: ' + nativeEvent, 'error');
                }}
                source={{ uri: `http://kup.direct/appconnect/service.php?session=${sessionId}` }}
                onMessage={event => {
                    const { data } = event.nativeEvent;
                    if (data === 'odrzuc') {
                        props.navigation.navigate('ScannerScreen')
                    } else if (data === 'wyslij') {
                        console.log('Wyslij has been pressed in Webview')
                    }
                }}
            />
        </>
    );
}