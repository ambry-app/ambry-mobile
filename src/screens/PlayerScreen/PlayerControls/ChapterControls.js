import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import {
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native-gesture-handler'
import Svg, { Path } from 'react-native-svg'
import { usePlayer } from '../../../contexts/Player'
import useBackButton from '../../../hooks/backButton'
import tw from '../../../lib/tailwind'
import { secondsDisplay } from '../../../lib/utils'

export function useChapters(ref, loading) {
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

  return { chaptersOpen, onChaptersChange, toggleChapters }
}

export default function ChapterControls({ toggleChapters }) {
  const { state } = usePlayer()
  const { currentChapter } = state

  return (
    <ActualChapterControls
      currentChapter={currentChapter}
      toggleChapters={toggleChapters}
    />
  )
}

const ActualChapterControls = memo(({ currentChapter, toggleChapters }) => {
  // console.log('RENDERING: ChapterControls')
  return (
    <TouchableOpacity onPress={toggleChapters}>
      <View style={tw`py-4`}>
        {currentChapter && (
          <Text
            style={tw`text-center text-lg text-gray-700 dark:text-gray-200`}
          >
            {currentChapter.title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
})

function ChaptersHeader() {
  return (
    <Text
      style={tw`text-2xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800`}
    >
      Chapters
    </Text>
  )
}

const ChapterItem = memo(({ chapter, active, onPress }) => {
  // console.log('RENDERING: ChaptersItem')
  return (
    <View style={tw`rounded-md overflow-hidden bg-white dark:bg-gray-800`}>
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.Ripple(tw.color('gray-600'), true)}
        onPress={() => onPress(chapter)}
      >
        <View
          style={[
            tw`flex-row mx-4 py-4 border-b items-center`,
            active
              ? tw`border-t-2 border-b-2 border-gray-500 dark:border-gray-400`
              : tw`border-gray-200 dark:border-gray-700`
          ]}
        >
          <View>
            {active && (
              <Svg height="10" width="10" viewBox="0 0 8 10" style={tw`-ml-4`}>
                <Path d="M 0 0 L 8 5 L 0 10" fill="white" />
              </Svg>
            )}
          </View>
          <Text
            style={[
              tw`flex-shrink text-lg pr-2`,
              active
                ? tw`text-gray-700 dark:text-gray-200`
                : tw`text-gray-500 dark:text-gray-400`
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
})

function ChaptersList({ sheetRef, isOpen }) {
  const { state, actions } = usePlayer()
  const { media, currentChapter } = state
  const { chapters } = media
  const { seekTo } = actions

  return (
    <ActualChapterList
      sheetRef={sheetRef}
      chapters={chapters}
      currentChapter={currentChapter}
      seekTo={seekTo}
      isOpen={isOpen}
    />
  )
}

const ActualChapterList = memo(
  ({ sheetRef, chapters, currentChapter, seekTo, isOpen }) => {
    // console.log('RENDERING: ChaptersList')
    const tabBarHeight = useBottomTabBarHeight()
    const ref = useRef()

    const onPress = useCallback(chapter => {
      seekTo(chapter.startTime)
      sheetRef.current.close()
    }, [])

    const renderItem = useCallback(
      ({ item: chapter }) => {
        return (
          <ChapterItem
            chapter={chapter}
            active={chapter.id == currentChapter?.id}
            onPress={onPress}
          />
        )
      },
      [currentChapter]
    )

    useEffect(() => {
      if (isOpen) {
        const index = chapters.findIndex(
          chapter => chapter.id == currentChapter?.id
        )
        if (index >= 0 && index < chapters.length) {
          ref.current.scrollToIndex({ index, viewPosition: 0.5 })
        }
      }
    }, [chapters, currentChapter, isOpen])

    return (
      <BottomSheetFlatList
        ref={ref}
        data={chapters}
        style={tw`px-4`}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListFooterComponent={() => <View style={{ height: tabBarHeight }} />}
        ListHeaderComponent={() => <ChaptersHeader />}
        stickyHeaderIndices={[0]}
      />
    )
  }
)

export function Chapters({ sheetRef, onChange, isOpen }) {
  // console.log('RENDERING: Chapters')
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
      <ChaptersList sheetRef={sheetRef} isOpen={isOpen} />
    </BottomSheet>
  )
}
