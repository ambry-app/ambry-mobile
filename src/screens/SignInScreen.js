import React, { useState } from 'react'
import {
  Button,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View
} from 'react-native'
import Logo from '../assets/logo_256x1056.svg'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import { useAmbryAPI } from '../contexts/AmbryAPI'
import tw from '../lib/tailwind'

export default function SignInScreen() {
  const { signIn } = useAmbryAPI()
  const [loading, isLoading] = useState(false)
  const [error, isError] = useState(false)
  const [email, setEmail] = useState('')
  const [host, setHost] = useState('')
  const [password, setPassword] = useState('')
  const scheme = useColorScheme()

  const signInCallback = async (...args) => {
    isError(false)
    isLoading(true)

    try {
      await signIn(...args)
    } catch (e) {
      isLoading(false)
      isError(true)
    }
  }

  return (
    <ScrollView style={tw`p-4`}>
      <View style={tw`py-8 items-center`}>
        <Logo
          height="86"
          width="352"
          brandColor={
            scheme === 'dark' ? tw.color('lime-400') : tw.color('lime-500')
          }
          textColor={
            scheme === 'dark' ? tw.color('gray-200') : tw.color('gray-700')
          }
        />
        <Text
          style={tw`text-lg font-semibold text-gray-500 dark:text-gray-400`}
        >
          Personal Audiobook Streaming
        </Text>
      </View>
      <TextInput
        placeholder="Host"
        value={host}
        autoCapitalize="none"
        onChangeText={setHost}
        style={tw`my-2 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 rounded px-3 py-2`}
        placeholderTextColor={
          scheme === 'dark' ? tw.color('gray-500') : tw.color('gray-300')
        }
      />
      <TextInput
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        textContentType="emailAddress"
        autoCompleteType="email"
        keyboardType="email-address"
        style={tw`my-2 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 rounded px-3 py-2`}
        placeholderTextColor={
          scheme === 'dark' ? tw.color('gray-500') : tw.color('gray-300')
        }
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={tw`my-2 mb-4 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 rounded px-3 py-2`}
        placeholderTextColor={
          scheme === 'dark' ? tw.color('gray-500') : tw.color('gray-300')
        }
      />
      <Button
        title="Sign in"
        color={tw.color('lime-500')}
        onPress={() => signInCallback(host, email, password)}
        disabled={loading}
      />
      {loading && <LargeActivityIndicator style={tw`mt-4`} />}
      {error && (
        <Text style={tw`mt-4 text-red-500 text-center`}>
          Invalid username or password
        </Text>
      )}
    </ScrollView>
  )
}
