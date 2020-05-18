import React from 'react';
import { StatusBar } from 'react-native'
import { WebView } from 'react-native-webview';
import WebViewErrorScreen from './WebViewErrorScreen'
import LoadingScreen from './LoadingScreen';
import * as Sentry from 'sentry-expo';
import { __SENTRY_DNS__, __ENDPOINT__ } from 'react-native-dotenv'

Sentry.init({
    dsn: __SENTRY_DNS__,
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
                    Sentry.captureMessage('WebView error on OffersScreen: ' + JSON.stringify(nativeEvent), 'error');
                }}
                renderError={() => <WebViewErrorScreen />}
                renderLoading={() => <LoadingScreen />}
                source={{ uri: `${__ENDPOINT__}session=${sessionId}` }}
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
