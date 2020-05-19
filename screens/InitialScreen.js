import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native'
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from 'sentry-expo';
import { __SENTRY_DNS__ } from 'react-native-dotenv'

Sentry.init({
    dsn: __SENTRY_DNS__,
    enableInExpoDevelopment: true,
    debug: true
});

export default ({ navigation }) => {

    const [state, setState] = useState({
        isCheckingNetComplete: false,
        isNetAvailable: false
    })

    useEffect(() => {
        async function checkInternetConnection() {
            try {
                let { isConnected } = await NetInfo.fetch()
                if (isConnected) {
                    navigation.navigate('ScannerScreen')
                    setState({
                        isCheckingNetComplete: true,
                        isNetAvailable: true
                    })
                } else {
                    setState({
                        isCheckingNetComplete: true,
                        isNetAvailable: false
                    })
                }
            } catch (error) {
                Sentry.captureMessage('Checking Internet connection failed: ' + JSON.stringify(error), 'error');
            }
        }
        checkInternetConnection();
    }, []);

    const popUpNoInternetAlert = () => {
        Alert.alert(
            'Niestety wykryto brak dostepu do Internetu',
            'Zamknij aplikacje, sprawdz ustawienia telefonu i sprobuj ponownie...',
            [{ text: 'OK' }],
        );
    }

    if (state.isNetAvailable || !state.isCheckingNetComplete) {
        return <View style={{ flex: 1, backgroundColor: '#f08032' }} />;
    } else {
        return (
            <View style={{
                flex: 1,
                backgroundColor: '#f08032',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{ color: 'white', fontSize: 20 }}>Brak dostepu do Internetu...</Text>
                {popUpNoInternetAlert()}
            </View>
        )
    }
}
