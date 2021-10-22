import React, { useEffect, useReducer, useCallback } from 'react'
import {
  FlatList,
  Image,
  Text,
  TouchableNativeFeedback,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '../contexts/Auth'

import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import WrappingList from './WrappingList'

import tw from '../lib/tailwind'

import { getRecentPlayerStates, imageSource } from '../api/ambry'
import { progressPercent } from '../lib/utils'
import { actionCreators, initialState, reducer } from '../reducers/playerStates'

function Item ({ playerState, authData, navigation }) {
  return (
    <TouchableNativeFeedback
      onPress={() =>
        navigation.navigate('PlayerScreen', { mediaId: playerState.media.id })
      }
    >
      <View style={tw`p-4 py-2 flex-row items-center`}>
        <View
          style={tw`w-1/4 rounded-xl border-gray-200 bg-gray-200 shadow-md`}
        >
          <Image
            source={imageSource(authData, playerState.media.book.imagePath)}
            style={tw.style('rounded-md', 'w-full', {
              aspectRatio: 10 / 15
            })}
          />
        </View>
        <View style={tw`pl-2 w-3/4`}>
          <Text style={tw`text-lg text-gray-700 dark:text-gray-200`}>
            {playerState.media.book.title}
          </Text>
          <WrappingList
            items={playerState.media.book.authors}
            style={tw`leading-none text-sm text-gray-500 dark:text-gray-400`}
          />
          <Text style={tw`text-lg text-lime-500 dark:text-lime-400`}>
            {progressPercent(playerState.media.duration, playerState.position)}
          </Text>
        </View>
      </View>
    </TouchableNativeFeedback>
  )
}

export default function ContinueListening ({ navigation }) {
  const { signOut, authData } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  const { playerStates, nextPage, hasMore, loading, refreshing, error } = state

  const fetchPlayerStates = useCallback(async () => {
    if (!hasMore) {
      return
    }

    dispatch(actionCreators.loading())

    try {
      const [nextPlayerStates, hasMore] = await getRecentPlayerStates(
        authData,
        nextPage
      )
      dispatch(actionCreators.success(nextPlayerStates, nextPage, hasMore))
    } catch (status) {
      if (status == 401) {
        await signOut()
      } else {
        dispatch(actionCreators.failure())
      }
    }
  }, [hasMore, nextPage])

  const refreshPlayerStates = useCallback(async () => {
    dispatch(actionCreators.refresh())

    try {
      const [nextPlayerStates, hasMore] = await getRecentPlayerStates(
        authData,
        1
      )
      dispatch(actionCreators.success(nextPlayerStates, 1, hasMore, true))
    } catch (status) {
      if (status == 401) {
        await signOut()
      } else {
        dispatch(actionCreators.failure())
      }
    }
  }, [])

  useEffect(() => {
    fetchPlayerStates()
  }, [])

  // We'll show an error only if the first page fails to load
  if (playerStates.length === 0) {
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
            Failed to load recent books!
          </Text>
        </ScreenCentered>
      )
    }
  }

  return (
    <SafeAreaView>
      <FlatList
        style={tw`py-2 mb-12`}
        data={playerStates}
        keyExtractor={item => item.id}
        onEndReached={fetchPlayerStates}
        onRefresh={refreshPlayerStates}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <Item
            playerState={item}
            authData={authData}
            navigation={navigation}
          />
        )}
        ListFooterComponent={
          <View style={tw`h-14`}>{loading && <LargeActivityIndicator />}</View>
        }
      />
    </SafeAreaView>
  )
}
