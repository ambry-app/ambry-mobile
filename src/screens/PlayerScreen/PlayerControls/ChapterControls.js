import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Text, View } from 'react-native'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
import tw from '../../../lib/tailwind'
import usePlayer, {
  seekNextChapter,
  seekPreviousChapter
} from '../../../stores/Player'

export default function ChapterControls() {
  // console.log('RENDERING: ChapterControls')
  const navigation = useNavigation()
  const currentChapter = usePlayer(state => state.currentChapter)

  return (
    <>
      {currentChapter && (
        <View style={tw`w-full flex flex-row items-center px-4`}>
          <View style={tw`h-6 w-6`}>
            <TouchableNativeFeedback
              onPress={() => {
                seekPreviousChapter()
              }}
              background={TouchableNativeFeedback.Ripple(
                tw.color('gray-400'),
                true
              )}
            >
              <FontAwesomeIcon
                icon="backward-step"
                size={24}
                color={tw.color('gray-100')}
              />
            </TouchableNativeFeedback>
          </View>
          <View style={tw`flex-1 px-2`}>
            <TouchableNativeFeedback
              onPress={() => {
                navigation.getParent('RightDrawer').openDrawer()
              }}
            >
              <Text
                numberOfLines={1}
                style={tw`py-4 text-center text-lg text-gray-100`}
              >
                {currentChapter.title}
              </Text>
            </TouchableNativeFeedback>
          </View>
          <View style={tw`h-6 w-6`}>
            <TouchableNativeFeedback
              onPress={() => {
                seekNextChapter()
              }}
              background={TouchableNativeFeedback.Ripple(
                tw.color('gray-400'),
                true
              )}
            >
              <FontAwesomeIcon
                icon="forward-step"
                size={24}
                color={tw.color('gray-100')}
              />
            </TouchableNativeFeedback>
          </View>
        </View>
      )}
    </>
  )
}
