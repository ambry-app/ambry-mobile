import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useDrawerStatus } from '@react-navigation/drawer'
import React, { useEffect, useRef } from 'react'
import { Text, View } from 'react-native'
import { FlatList, TouchableNativeFeedback } from 'react-native-gesture-handler'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import shallow from 'zustand/shallow'
import tw from '../lib/tailwind'
import { secondsDisplay } from '../lib/utils'
import usePlayer, { seekTo } from '../stores/Player'

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
      <View style={tw`flex-row px-4 py-2 items-center`}>
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

  const { bottom } = useSafeAreaInsets()
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

  if (!media) {
    return (
      <View style={tw`m-4`}>
        <Text style={tw`text-gray-200 mb-4`}>
          This is the chapter list. Load a book into the player by visiting the
          Library and this drawer will display the book's chapters.
        </Text>
      </View>
    )
  }

  if (media.chapters.length === 0) {
    return (
      <View style={tw`m-4`}>
        <Text style={tw`text-gray-200 mb-4`}>
          This is the chapter list. This drawer will display the book's
          chapters. Unfortunately, this book has no chapters defined.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      ref={ref}
      data={media?.chapters || []}
      style={tw`mx-2 rounded-t-xl bg-gray-800`}
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
      ListFooterComponent={<View style={{ paddingBottom: bottom }} />}
    />
  )
}

export default function RightDrawerContents({ navigation }) {
  return (
    <SafeAreaView edges={['left', 'top', 'right']}>
      <ChaptersList navigation={navigation} />
    </SafeAreaView>
  )
}
