import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React, { useEffect, useRef } from 'react'
import { Text, View } from 'react-native'
import { FlatList, TouchableNativeFeedback } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from '../lib/tailwind'
import { secondsDisplay } from '../lib/utils'
import usePlayer, { seekTo } from '../stores/Player'
import shallow from 'zustand/shallow'
import { useDrawerStatus } from '@react-navigation/drawer'

const CHAPTER_HEIGHT = 52

const ChapterItem = ({ chapter, active, navigation }) => {
  // console.log('RENDERING: ChaptersItem')

  return (
    <TouchableNativeFeedback
      onPress={() => {
        seekTo(chapter.startTime)
        navigation.closeDrawer()
      }}
    >
      <View style={tw`flex-row px-4 py-3 items-center`}>
        <View style={tw`w-7`}>
          {active && (
            <FontAwesomeIcon
              icon="volume-high"
              size={24}
              color="white"
              style={tw`-ml-1`}
            />
          )}
        </View>
        <Text
          numberOfLines={1}
          style={[
            tw`flex-shrink pr-2 text-lg`,
            active ? tw`text-gray-200` : tw`text-gray-400`
          ]}
        >
          {chapter.title}
        </Text>
        <Text style={tw`flex-grow text-right italic text-lime-400`}>
          {secondsDisplay(chapter.startTime)}
        </Text>
      </View>
    </TouchableNativeFeedback>
  )
}

const playerSelector = [state => [state.media, state.currentChapter], shallow]

const ChaptersList = ({ navigation }) => {
  // console.log('RENDERING: ChaptersList')

  const isOpen = useDrawerStatus() === 'open'
  const [media, currentChapter] = usePlayer(...playerSelector)
  const ref = useRef()

  useEffect(() => {
    if (!media) return

    const index = media.chapters.findIndex(
      chapter => chapter.id === currentChapter?.id
    )
    if (index >= 0 && index < media.chapters.length) {
      ref.current.scrollToIndex({ index, viewPosition: 0.5 })
    }
  }, [media, currentChapter, isOpen])

  return (
    <FlatList
      ref={ref}
      data={media?.chapters || []}
      style={tw`m-2 rounded-xl bg-gray-800`}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ChapterItem
          chapter={item}
          active={item.id === currentChapter?.id}
          navigation={navigation}
        />
      )}
      getItemLayout={(_data, index) => ({
        length: CHAPTER_HEIGHT,
        offset: CHAPTER_HEIGHT * index,
        index
      })}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <View style={tw`px-4 pt-2 rounded-t-xl bg-gray-800 shadow-lg`}>
          <Text style={tw`mb-1 text-xl font-bold text-gray-100`}>Chapters</Text>
        </View>
      }
    />
  )
}

export default function RightDrawerContents({ navigation }) {
  return (
    <SafeAreaView>
      <ChaptersList navigation={navigation} />
    </SafeAreaView>
  )
}
