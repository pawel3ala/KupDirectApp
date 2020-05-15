import React from 'react';
import { StatusBar } from 'react-native'
import { WebView } from 'react-native-webview';
import WebViewErrorScreen from './WebViewErrorScreen'
import LoadingScreen from './LoadingScreen';
import * as Sentry from 'sentry-expo';
import { SENTRY_DNS, ENDPOINT } from 'react-native-dotenv'

Sentry.init({
    dsn: SENTRY_DNS,
    enableInExpoDevelopment: true,
    debug: true
});

export default function Offers(props) {

    const { sessionId } = props.route.params

    return (
        <>
            <StatusBar hidden={true} />
            <WebView
                javaScriptEnabled
                style={{ flex: 1 }}
                onError={syntheticEvent => {
                    const { nativeEvent } = syntheticEvent;
                    Sentry.captureMessage('WebView error on OffersScreen: ' + nativeEvent, 'error');
                }}
                renderError={() => <WebViewErrorScreen />}
                renderLoading={() => <LoadingScreen />}
                source={{ uri: `${ENDPOINT}session=${sessionId}` }}
                onMessage={event => {
                    const { data } = event.nativeEvent;
                    if (data === 'odrzuc') {
                        props.navigation.navigate('ScannerScreen')
                    } else if (data === 'wyslij') {
                        Sentry.captureMessage('Wyslij has been pressed', 'info')
                    }
                    else {
                        Sentry.captureMessage('Unknown msg from Webview has been sent', 'error')
                    }
                }}
            />
        </>
    );
}