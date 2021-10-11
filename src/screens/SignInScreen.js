import React, { useState } from 'react'
import { Button, TextInput } from 'react-native'

import LargeActivityIndicator from '../components/LargeActivityIndicator'
import { useAuth } from '../contexts/Auth'

export default function SignInScreen () {
  const auth = useAuth()
  const [loading, isLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signIn = async (email, password) => {
    isLoading(true)
    await auth.signIn(email, password)
  }

  return (
    <>
      <TextInput placeholder='Email' value={email} onChangeText={setEmail} />
      <TextInput
        placeholder='Password'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <LargeActivityIndicator />
      ) : (
        <Button title='Sign in' onPress={() => signIn(email, password)} />
      )}
    </>
  )
}
