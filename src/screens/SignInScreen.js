import { Picker } from '@react-native-picker/picker'
import React, { useEffect, useState } from 'react'
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
import tw from '../lib/tailwind'
import useAmbryAPI, { useLoginAction } from '../stores/AmbryAPI'

export default function SignInScreen() {
  const knownHosts = useAmbryAPI(state => state.knownHosts)
  const [showHostInput, setShowHostInput] = useState()
  const [email, setEmail] = useState('')
  const [host, setHost] = useState('')
  const [password, setPassword] = useState('')
  const scheme = useColorScheme()

  useEffect(() => {
    if (knownHosts[0]) {
      setHost(knownHosts[0])
    }
  }, [knownHosts])

  const { isLoading, isError, login } = useLoginAction(host, email, password)

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
      {knownHosts.length === 0 || showHostInput ? (
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
      ) : (
        <View
          style={tw`my-2 border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 rounded`}
        >
          <Picker
            selectedValue={host}
            onValueChange={(itemValue, _itemIndex) =>
              itemValue === 'new'
                ? (() => {
                    setShowHostInput(true)
                    setHost('')
                  })()
                : setHost(itemValue)
            }
            style={tw`text-gray-700 dark:text-gray-200`}
            dropdownIconColor={
              scheme === 'dark' ? tw.color('gray-200') : tw.color('gray-700')
            }
          >
            {knownHosts.map(selectableHost => (
              <Picker.Item
                key={selectableHost}
                label={selectableHost}
                value={selectableHost}
              />
            ))}
            <Picker.Item label="New Host" value="new" />
          </Picker>
        </View>
      )}
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
        onPress={login}
        disabled={isLoading}
      />
      {isLoading && <LargeActivityIndicator style={tw`mt-4`} />}
      {isError && (
        <Text style={tw`mt-4 text-red-500 text-center`}>
          Invalid username or password
        </Text>
      )}
    </ScrollView>
  )
}
