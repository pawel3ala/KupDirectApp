import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native'
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from 'sentry-expo';
import { __SENTRY_DNS__ } from 'react-native-dotenv'

Sentry.init({
    dsn: __SENTRY_DNS__,
    enableInExpoDevelopment: true,
    debug: true
});

export default ({ navigation }) => {

    const [isCheckingNetComplete, setIsCheckingNetComplete] = useState(false);
    const [isNetAvailable, setIsNetAvailable] = useState(false);

    useEffect(() => {
        async function checkInternetConnection() {
            try {
                let { isConnected } = await NetInfo.fetch()
                if (isConnected) {
                    navigation.navigate('ScannerScreen')
                    setIsNetAvailable(true)
                } else {
                    setIsNetAvailable(false)
                }
            } catch (error) {
                Sentry.captureMessage('Checking Internet connection failed: ' + JSON.stringify(error), 'error');
            } finally {
                setIsCheckingNetComplete(true)
            }
        }
        checkInternetConnection();
    }, []);

    if (!isCheckingNetComplete || isNetAvailable) {
        return <View style={{ flex: 1, backgroundColor: '#f08032' }} />;
    } else {
        return (
            <>
                <View style={{
                     flex: 1,
                      backgroundColor: '#f08032',
                      justifyContent: 'center',
                      alignItems: 'center' }}>
                    <Text >Brak dostepu do internetu</Text>
                </View>
            </>
        )
    }
}
