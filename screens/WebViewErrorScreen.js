import React from 'react'
import { View, Text } from 'react-native'

const WebViewErrorScreen = () => {
    return (
        <View style={{
            flex: 1,
            backgroundColor: '#f08032',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Text style={{ color: 'white', fontSize: 20 }}>Nastapil blad wczytywania aplikacji</Text>
        </View>
    )
}

export default WebViewErrorScreen
