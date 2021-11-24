import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import React, {
  createRef,
  useCallback,
  useEffect,
  useReducer,
  useState
} from 'react'
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import {
  LongPressGestureHandler,
  State,
  TouchableNativeFeedback
} from 'react-native-gesture-handler'
import Bookmark from '../../assets/bookmark.svg'
import LargeActivityIndicator from '../../components/LargeActivityIndicator'
import PlusCircleButton from '../../components/PlusCircleButton'
import ScreenCentered from '../../components/ScreenCentered'
import { useAmbryAPI } from '../../contexts/AmbryAPI'
import { useSelectedMedia } from '../../contexts/SelectedMedia'
import useBackButton from '../../hooks/backButton'
import tw from '../../lib/tailwind'
import { secondsDisplay } from '../../lib/utils'
import { actionCreators, initialState, reducer } from '../../reducers/bookmarks'

export function useBookmarks(ref, loadingMedia) {
  const [bookmarksOpen, setBookmarksOpen] = useState(false)

  const onBookmarksChange = useCallback(index => {
    if (index == -1) {
      setBookmarksOpen(false)
    } else {
      setBookmarksOpen(true)
    }
  }, [])

  const toggleBookmarks = useCallback(() => {
    if (!ref.current) {
      return
    }

    if (bookmarksOpen) {
      ref.current.dismiss()
    } else {
      ref.current.present()
    }
  }, [bookmarksOpen])

  const closeOnBack = useCallback(() => {
    if (bookmarksOpen) {
      ref.current.dismiss()
      return true
    } else {
      return false
    }
  }, [bookmarksOpen])

  useBackButton(closeOnBack)

  // Updates sheet open state when loading new media, because the sheet is
  // re-rendered in a closed state.
  useEffect(() => {
    if (loadingMedia) {
      setBookmarksOpen(false)
    }
  }, [loadingMedia])

  return { onBookmarksChange, toggleBookmarks }
}

export function BookmarksToggle({ click }) {
  const scheme = useColorScheme()

  return (
    <TouchableOpacity onPress={click}>
      <Bookmark
        width={30}
        height={30}
        iconColor={
          scheme === 'dark' ? tw.color('gray-400') : tw.color('gray-500')
        }
      />
    </TouchableOpacity>
  )
}

function BookmarksHeader({ click }) {
  return (
    <View style={tw`flex-row flex-row-reverse my-2 `}>
      <View
        style={tw`border border-lime-500 rounded-lg bg-white dark:bg-gray-800 overflow-hidden`}
      >
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple(
            tw.color('gray-400'),
            true
          )}
          onPress={click}
        >
          <View style={tw`px-2 py-1 flex-row items-center`}>
            <PlusCircleButton height={24} width={24} />
            <Text style={tw`text-lg text-lime-400 dark:text-lime-500 pl-1`}>
              New Bookmark
            </Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    </View>
  )
}

function BookmarkItem({
  bookmark,
  longPressRef,
  sheetRef,
  refreshBookmarks,
  seek
}) {
  const seekTo = useCallback(() => {
    seek(bookmark.position)
    sheetRef.current.close()
  }, [])

  return (
    <View style={tw`rounded-md overflow-hidden bg-white dark:bg-gray-800`}>
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.Ripple(tw.color('gray-600'), true)}
        onPress={seekTo}
      >
        <LongPressGestureHandler
          ref={longPressRef}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              console.log('TODO: present options to edit and delete')
            }
          }}
          minDurationMs={500}
          maxDist={100}
        >
          <View
            style={tw`flex-row py-2 border-b border-gray-200 dark:border-gray-700`}
          >
            <Text
              style={tw`text-lg italic text-lime-400 dark:text-lime-500 pr-2 w-1/4`}
            >
              {secondsDisplay(bookmark.position)}
            </Text>

            <Text style={tw`text-lg text-gray-700 dark:text-gray-200 w-3/4`}>
              {bookmark.label}
            </Text>
          </View>
        </LongPressGestureHandler>
      </TouchableNativeFeedback>
    </View>
  )
}

function BookmarksList({ longPressRef, sheetRef, seek }) {
  const { listBookmarks } = useAmbryAPI()
  const tabBarHeight = useBottomTabBarHeight()
  const { selectedMedia } = useSelectedMedia()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { bookmarks, nextPage, hasMore, loading, refreshing, error } = state

  const fetchBookmarks = useCallback(async () => {
    if (!hasMore) {
      return
    }

    dispatch(actionCreators.loading())

    try {
      const [nextBookmarks, hasMore] = await listBookmarks(
        selectedMedia,
        nextPage
      )
      dispatch(actionCreators.success(nextBookmarks, nextPage, hasMore))
    } catch {
      dispatch(actionCreators.failure())
    }
  }, [selectedMedia, hasMore, nextPage])

  const refreshBookmarks = useCallback(async () => {
    dispatch(actionCreators.refresh())

    try {
      const [bookmarks, hasMore] = await listBookmarks(selectedMedia, 1)
      dispatch(actionCreators.success(bookmarks, 1, hasMore, true))
    } catch {
      dispatch(actionCreators.failure())
    }
  }, [selectedMedia])

  useEffect(() => {
    fetchBookmarks()
  }, [])

  if (loading) {
    return (
      <ScreenCentered>
        <LargeActivityIndicator />
      </ScreenCentered>
    )
  }

  if (error) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-700 dark:text-gray-200`}>
          Failed to load bookmarks!
        </Text>
      </ScreenCentered>
    )
  }

  return (
    <BottomSheetFlatList
      data={bookmarks}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <BookmarkItem
          bookmark={item}
          longPressRef={longPressRef}
          sheetRef={sheetRef}
          refreshBookmarks={refreshBookmarks}
          seek={seek}
        />
      )}
      onEndReached={fetchBookmarks}
      // onRefresh={refreshBookmarks}
      // refreshing={refreshing}
      ListFooterComponent={() => <View style={{ height: tabBarHeight }} />}
      ListHeaderComponent={() => (
        <BookmarksHeader click={() => console.log('new bookmark')} />
      )}
      stickyHeaderIndices={[0]}
    />
  )
}

export function Bookmarks({ sheetRef, onChange, seek }) {
  const longPressRef = createRef()

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      style={tw`px-4`}
      backgroundStyle={tw`bg-white dark:bg-gray-800`}
      handleIndicatorStyle={tw`bg-gray-700 dark:bg-gray-200`}
      enablePanDownToClose={true}
      snapPoints={['60%']}
      onChange={onChange}
      waitFor={longPressRef}
    >
      <BookmarksList
        longPressRef={longPressRef}
        sheetRef={sheetRef}
        seek={seek}
      />
    </BottomSheetModal>
  )
}
