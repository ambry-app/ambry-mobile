import React, { useCallback, useEffect } from 'react'
import { Button, Text, View } from 'react-native'
import { Dirs, FileSystem } from 'react-native-file-access'
import { ScrollView } from 'react-native-gesture-handler'
import SafeBottomBorder from '../components/SafeBottomBorder'
import tw from '../lib/tailwind'
import useAmbryAPI, { useLogoutAction } from '../stores/AmbryAPI'
import { destroy } from '../stores/Player'

export default function DownloadsScreen({ navigation }) {
  useEffect(() => {
    async function listDownloads() {
      const files = await FileSystem.ls(`${Dirs.DocumentDir}/downloads`)
      console.log(files)
    }
    listDownloads()
  }, [])

  return (
    <SafeBottomBorder>
      <ScrollView>
        <View style={tw`p-4`}>
          <Text>Foo</Text>
        </View>
      </ScrollView>
    </SafeBottomBorder>
  )
}
