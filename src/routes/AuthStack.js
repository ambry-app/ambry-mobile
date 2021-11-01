import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import SignInScreen from '../screens/SignInScreen'

const Stack = createNativeStackNavigator()

export const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='SignIn'
        options={{ title: 'Sign In' }}
        component={SignInScreen}
      />
    </Stack.Navigator>
  )
}
