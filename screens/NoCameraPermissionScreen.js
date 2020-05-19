import React from 'react'
import { View, Text } from 'react-native'

const NoCameraPermissionScreen = () => {
    return (
        <View style={{
            flex: 1,
            backgroundColor: '#f08032',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Text style={{ color: 'white', fontSize: 20 }}>Brak dostepu do kemery ...</Text>
        </View>
    )
}

export default NoCameraPermissionScreen
