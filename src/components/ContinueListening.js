import React, { useCallback, useReducer } from 'react'
import {
  Button,
  FlatList,
  Image,
  Text,
  TouchableNativeFeedback,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import useFirstRender from '../hooks/firstRender'
import tw from '../lib/tailwind'
import { progressPercent } from '../lib/utils'
import { actionCreators, initialState, reducer } from '../reducers/playerStates'
import { getRecentPlayerStates, signOut, uriSource } from '../stores/AmbryAPI'
import usePlayer, { destroy, loadMedia } from '../stores/Player'
import WrappingList from './WrappingList'

function Item({ playerState, navigation }) {
  const selectedMedia = usePlayer(state => state.selectedMedia)

  return (
    <TouchableNativeFeedback
      onPress={() => {
        navigation.navigate('PlayerScreen')

        if (selectedMedia?.id !== playerState.media.id) {
          loadMedia(playerState.media.id, playerState.media.book.imagePath)
        }
      }}
    >
      <View style={tw`p-4 py-2 flex-row items-center`}>
        <View
          style={tw`w-1/4 rounded-xl border-gray-200 bg-gray-200 shadow-md`}
        >
          <Image
            source={uriSource(playerState.media.book.imagePath)}
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

export default function ContinueListening({ navigation }) {
  const isFirstRender = useFirstRender()
  const [state, dispatch] = useReducer(reducer, initialState)

  const { playerStates, nextPage, hasMore, loading, refreshing, error } = state

  const fetchPlayerStates = useCallback(async () => {
    if (!hasMore) return

    dispatch(actionCreators.loading())

    try {
      const [nextPlayerStates, newHasMore] = await getRecentPlayerStates(
        nextPage
      )
      dispatch(actionCreators.success(nextPlayerStates, nextPage, newHasMore))
    } catch {
      dispatch(actionCreators.failure())
    }
  }, [hasMore, nextPage])

  const refreshPlayerStates = useCallback(async () => {
    dispatch(actionCreators.refresh())

    try {
      const [nextPlayerStates, newHasMore] = await getRecentPlayerStates(1)
      dispatch(actionCreators.success(nextPlayerStates, 1, newHasMore, true))
    } catch {
      dispatch(actionCreators.failure())
    }
  }, [])

  const clearMediaAndNavigate = useCallback(() => {
    destroy()
    navigation.navigate('PlayerScreen')
  }, [navigation])

  const clearMediaAndSignOut = useCallback(() => {
    destroy()
    signOut()
  }, [])

  if (isFirstRender) {
    fetchPlayerStates()
  }

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
          <Item playerState={item} navigation={navigation} />
        )}
        ListFooterComponent={
          <View style={tw`h-22`}>
            {__DEV__ && (
              <>
                <View style={tw`mb-2`}>
                  <Button
                    title="Clear Selected Media"
                    onPress={clearMediaAndNavigate}
                  />
                </View>
                <Button title="Sign Out" onPress={clearMediaAndSignOut} />
              </>
            )}
            {loading && <LargeActivityIndicator />}
          </View>
        }
      />
    </SafeAreaView>
  )
}
