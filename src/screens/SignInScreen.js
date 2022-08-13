import React, { useEffect, useState } from 'react'
import { Button, Text, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import Logo from '../assets/logo.svg'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import tw from '../lib/tailwind'
import useAmbryAPI, { useLoginAction } from '../stores/AmbryAPI'

DropDownPicker.setTheme('DARK')
DropDownPicker.setListMode('SCROLLVIEW')

export default function SignInScreen() {
  const knownHosts = useAmbryAPI(state => state.knownHosts)
  const [showHostInput, setShowHostInput] = useState()
  const [email, setEmail] = useState('')
  const [host, setHost] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (knownHosts[0]) {
      setHost(knownHosts[0])
    }
  }, [knownHosts])

  useEffect(() => {
    if (host === 'new') {
      setShowHostInput(true)
      setHost('')
    }
  }, [host])

  const { isLoading, isError, login } = useLoginAction(host, email, password)

  const [hostPickerOpen, setHostPickerOpen] = useState(false)
  const [hostPickerItems, setHostPickerItems] = useState(
    knownHosts
      .map(selectableHost => ({
        label: selectableHost,
        value: selectableHost
      }))
      .concat([{ label: 'New Host', value: 'new' }])
  )

  return (
    <ScrollView style={tw`p-4`}>
      <View style={tw`py-8 items-center`}>
        <Logo height="64" />
        <Text style={tw`text-lg font-semibold text-gray-400`}>
          Personal Audiobook Streaming
        </Text>
      </View>

      {knownHosts.length === 0 || showHostInput ? (
        <TextInput
          placeholder="Host"
          value={host}
          autoCapitalize="none"
          onChangeText={setHost}
          style={tw`my-2 text-gray-200 bg-gray-800 rounded px-3 py-2`}
          placeholderTextColor={tw.color('gray-500')}
        />
      ) : (
        <DropDownPicker
          open={hostPickerOpen}
          value={host}
          items={hostPickerItems}
          setOpen={setHostPickerOpen}
          setValue={setHost}
          setItems={setHostPickerItems}
          style={tw`bg-gray-800 border-0 rounded my-2`}
          textStyle={tw`text-gray-200`}
          listItemContainerStyle={tw`bg-gray-900`}
        />
      )}
      <TextInput
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        textContentType="emailAddress"
        autoCompleteType="email"
        keyboardType="email-address"
        style={tw`my-2 text-gray-200 bg-gray-800 rounded px-3 py-2`}
        placeholderTextColor={tw.color('gray-500')}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={tw`my-2 mb-4 text-gray-200 bg-gray-800 rounded px-3 py-2`}
        placeholderTextColor={tw.color('gray-500')}
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
