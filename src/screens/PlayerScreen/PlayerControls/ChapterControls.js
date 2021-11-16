import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React, { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import {
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native-gesture-handler'
import useBackButton from '../../../hooks/backButton'
import tw from '../../../lib/tailwind'
import { secondsDisplay } from '../../../lib/utils'

export function useChapters (ref, loading) {
  const [chaptersOpen, setChaptersOpen] = useState(false)

  const onChaptersChange = useCallback(index => {
    if (index == -1) {
      setChaptersOpen(false)
    } else {
      setChaptersOpen(true)
    }
  }, [])

  const toggleChapters = useCallback(() => {
    if (!ref.current) {
      return
    }

    if (chaptersOpen) {
      ref.current.close()
    } else {
      ref.current.snapToIndex(0)
    }
  }, [chaptersOpen])

  const closeOnBack = useCallback(() => {
    if (chaptersOpen) {
      ref.current.close()
      return true
    } else {
      return false
    }
  }, [chaptersOpen])

  useBackButton(closeOnBack)

  // Updates sheet open state when loading new media, because the sheet is
  // re-rendered in a closed state.
  useEffect(() => {
    if (loading) {
      setChaptersOpen(false)
    }
  }, [loading])

  return { onChaptersChange, toggleChapters }
}

export default function ChapterControls ({ currentChapter, toggleChapters }) {
  return (
    // <TouchableOpacity onPress={toggleChapters}>
    <View style={tw`py-4`}>
      {currentChapter && (
        <Text style={tw`text-center text-lg text-gray-200`}>
          {currentChapter.title}
        </Text>
      )}
    </View>
    // </TouchableOpacity>
  )
}

function ChaptersHeader () {
  return (
    <Text
      style={tw`text-2xl font-bold text-gray-500 border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800`}
    >
      Chapters
    </Text>
  )
}

function ChapterItem ({ chapter, sheetRef, seek, currentChapter }) {
  const seekTo = useCallback(() => {
    seek(chapter.startTime)
    sheetRef.current.close()
  }, [])

  return (
    <View style={tw`rounded-md overflow-hidden bg-white dark:bg-gray-800`}>
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.Ripple(tw.color('gray-600'), true)}
        onPress={seekTo}
      >
        <View
          style={tw`flex-row py-4 border-b border-gray-200 dark:border-gray-700`}
        >
          <Text
            style={[
              tw`flex-shrink text-lg pr-2`,
              currentChapter && currentChapter.id == chapter.id
                ? tw`text-gray-700 dark:text-gray-200`
                : tw`text-gray-500 dark:text-gray-500`
            ]}
          >
            {chapter.title}
          </Text>
          <Text
            style={tw`flex-grow text-lg text-right italic text-lime-400 dark:text-lime-500`}
          >
            {secondsDisplay(chapter.startTime)}
          </Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  )
}

function ChaptersList ({ sheetRef, seek, chapters, currentChapter }) {
  const tabBarHeight = useBottomTabBarHeight()

  return (
    <BottomSheetFlatList
      data={chapters}
      style={tw`px-4`}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ChapterItem
          chapter={item}
          sheetRef={sheetRef}
          seek={seek}
          currentChapter={currentChapter}
        />
      )}
      ListFooterComponent={() => <View style={{ height: tabBarHeight }}></View>}
      ListHeaderComponent={() => <ChaptersHeader />}
      stickyHeaderIndices={[0]}
    />
  )
}

export function Chapters ({
  sheetRef,
  onChange,
  seek,
  chapters,
  currentChapter
}) {
  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      backgroundStyle={tw`bg-white dark:bg-gray-800`}
      handleIndicatorStyle={tw`bg-gray-700 dark:bg-gray-200`}
      enablePanDownToClose={true}
      snapPoints={['80%']}
      onChange={onChange}
    >
      <ChaptersList
        sheetRef={sheetRef}
        seek={seek}
        chapters={chapters}
        currentChapter={currentChapter}
      />
    </BottomSheet>
  )
}
