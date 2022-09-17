import React, { useCallback } from 'react'
import { Button, Text, View } from 'react-native'
import tw from '../lib/tailwind'
import useAmbryAPI, { useLogoutAction } from '../stores/AmbryAPI'
import { destroy } from '../stores/Player'

export default function SettingsScreen({ navigation }) {
  const { logout } = useLogoutAction()
  const _authData = useAmbryAPI(state => state._authData)
  const showDebug = __DEV__

  const clearMediaAndNavigate = useCallback(() => {
    destroy()
    navigation.navigate('Player')
  }, [navigation])

  const clearMediaAndSignOut = useCallback(() => {
    logout()
    navigation.navigate('Player')
  }, [navigation, logout])

  return (
    <View style={tw`p-4`}>
      <View>
        <Text style={tw`text-lg text-gray-200`}>
          Signed in as {_authData.email}
        </Text>
        <Text style={tw`mb-2 text-gray-200`}>Host: {_authData.host}</Text>
        <Button
          title="Sign Out"
          color={tw.color('lime-500')}
          onPress={clearMediaAndSignOut}
        />
      </View>
      {showDebug && (
        <View style={tw`mt-8`}>
          <Text style={tw`mb-2 text-lg text-gray-200`}>Debug options:</Text>
          <Button
            title="Unload selected book"
            color={tw.color('lime-500')}
            onPress={clearMediaAndNavigate}
          />
        </View>
      )}
    </View>
  )
}
