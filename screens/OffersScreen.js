import React from 'react';
import { StatusBar } from 'react-native'
import { WebView } from 'react-native-webview';
import WebViewErrorScreen from './WebViewErrorScreen'
import LoadingScreen from './LoadingScreen';
import * as Sentry from 'sentry-expo';

Sentry.init({
    dsn: 'https://f8a02133e800455c86bee49793874e17@sentry.io/2581571',
    enableInExpoDevelopment: true,
    debug: true
  });

export default function Offers(props) {

    let sessionId;

    if (!props.route.params) {
        sessionId = 'fcff9d7d1c7c04cf38a5ac112d0a11898e391df8'
    }
    else {
        sessionId = props.route.params.sessionId
    }

    return (
        <>
            <StatusBar hidden={true} />
            <WebView
                // scalesPageToFit
                javaScriptEnabled
                style={{ flex: 1 }}
                onError={syntheticEvent => {
                    const { nativeEvent } = syntheticEvent;
                    Sentry.captureMessage('WebView error on OffersScreen: ' + nativeEvent, 'error');
                }}
                renderError={() => <WebViewErrorScreen />}
                renderLoading={() => <LoadingScreen />}
                source={{ uri: `http://kup.direct/appconnect/service.php?session=${sessionId}` }}
                onMessage={event => {
                    const { data } = event.nativeEvent;
                    if (data === 'odrzuc') {
                        props.navigation.navigate('ScannerScreen')
                    } else if (data === 'wyslij') {
                        Sentry.captureMessage('Wyslij has been pressed', 'info')                    }
                    else {
                        Sentry.captureMessage('Unknown msg from Webview has been sent', 'error')
                    }
                }}
            />
        </>
    );
}