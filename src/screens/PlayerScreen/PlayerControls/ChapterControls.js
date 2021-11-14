import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React, { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import {
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native-gesture-handler'
import { useProgress } from 'react-native-track-player'
import useBackButton from '../../../hooks/backButton'
import tw from '../../../lib/tailwind'
import { secondsDisplay } from '../../../lib/utils'

export function useChapters (ref, loadingMedia) {
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
      ref.current.dismiss()
    } else {
      ref.current.present()
    }
  }, [chaptersOpen])

  const closeOnBack = useCallback(() => {
    if (chaptersOpen) {
      ref.current.dismiss()
      return true
    } else {
      return false
    }
  }, [chaptersOpen])

  useBackButton(closeOnBack)

  // Updates sheet open state when loading new media, because the sheet is
  // re-rendered in a closed state.
  useEffect(() => {
    if (loadingMedia) {
      setChaptersOpen(false)
    }
  }, [loadingMedia])

  return { onChaptersChange, toggleChapters }
}

export default function ChapterControls ({
  playerState,
  loadingTrack,
  toggleChapters
}) {
  const progress = useProgress()
  const [chapter, setChapter] = useState()

  useEffect(() => {
    const {
      media: { chapters }
    } = playerState
    let currentChapter

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i]

      if (progress.position >= chapter.time) {
        currentChapter = chapter
      }

      setChapter(currentChapter)
    }
  }, [playerState, progress])

  return (
    <TouchableOpacity onPress={toggleChapters}>
      <View style={tw`py-4`}>
        {chapter && !loadingTrack && (
          <Text style={tw`text-center text-lg text-gray-200`}>
            {chapter.title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

// function ChaptersHeader ({ click }) {
//   return (
//     <View style={tw`flex-row flex-row-reverse my-2 `}>
//       <View
//         style={tw`border border-lime-500 rounded-lg bg-white dark:bg-gray-800 overflow-hidden`}
//       >
//         <TouchableNativeFeedback
//           background={TouchableNativeFeedback.Ripple(
//             tw.color('gray-400'),
//             true
//           )}
//           onPress={click}
//         >
//           <View style={tw`px-2 py-1 flex-row items-center`}>
//             <PlusCircleButton height={24} width={24} />
//             <Text style={tw`text-lg text-lime-400 dark:text-lime-500 pl-1`}>
//               New Chapter
//             </Text>
//           </View>
//         </TouchableNativeFeedback>
//       </View>
//     </View>
//   )
// }

function ChapterItem ({ chapter, sheetRef, seek }) {
  const seekTo = useCallback(() => {
    seek(chapter.time)
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
            style={tw`flex-grow text-lg text-gray-700 dark:text-gray-200 pr-2`}
          >
            {chapter.title}
          </Text>
          <Text
            style={tw`text-lg text-right italic text-lime-400 dark:text-lime-500`}
          >
            {secondsDisplay(chapter.time)}
          </Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  )
}

function ChaptersList ({ sheetRef, seek, chapters }) {
  const tabBarHeight = useBottomTabBarHeight()

  return (
    <BottomSheetFlatList
      data={chapters}
      keyExtractor={item => item.time.toString()}
      renderItem={({ item }) => (
        <ChapterItem chapter={item} sheetRef={sheetRef} seek={seek} />
      )}
      ListFooterComponent={() => <View style={{ height: tabBarHeight }}></View>}
      // ListHeaderComponent={() => (
      //   <ChaptersHeader click={() => console.log('new chapter')} />
      // )}
      // stickyHeaderIndices={[0]}
    />
  )
}

export function Chapters ({ sheetRef, onChange, seek, chapters }) {
  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      style={tw`px-4`}
      backgroundStyle={tw`bg-white dark:bg-gray-800`}
      handleIndicatorStyle={tw`bg-gray-700 dark:bg-gray-200`}
      enablePanDownToClose={true}
      snapPoints={['80%']}
      onChange={onChange}
    >
      <ChaptersList sheetRef={sheetRef} seek={seek} chapters={chapters} />
    </BottomSheetModal>
  )
}
