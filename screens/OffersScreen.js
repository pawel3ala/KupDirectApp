import React, { useEffect } from 'react';
import { StatusBar } from 'react-native'
import { WebView } from 'react-native-webview';
import { ScreenOrientation } from 'expo';
import * as Sentry from 'sentry-expo';

Sentry.init({
    dsn: 'https://f8a02133e800455c86bee49793874e17@sentry.io/2581571',
    enableInExpoDevelopment: true,
    debug: true
});

export default function Offers(props) {

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
                javaScriptEnabled
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