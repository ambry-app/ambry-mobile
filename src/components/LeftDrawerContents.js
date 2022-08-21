import React, { useCallback } from 'react'
import { Button, Image, Text, View } from 'react-native'
import { FlatList, TouchableNativeFeedback } from 'react-native-gesture-handler'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRefreshOnDrawerOpen } from '../hooks/refetchOnDrawerOpen'
import tw from '../lib/tailwind'
import { progressPercent } from '../lib/utils'
import { useLogoutAction, usePlayerStates, useSource } from '../stores/AmbryAPI'
import usePlayer, {
  destroy,
  loadMedia,
  setLoadingImage
} from '../stores/Player'
import LargeActivityIndicator from './LargeActivityIndicator'
import ScreenCentered from './ScreenCentered'
import WrappingList from './WrappingList'

function PlayerStateItem({ playerState, navigation }) {
  const selectedMedia = usePlayer(state => state.selectedMedia)
  const source = useSource()

  return (
    <TouchableNativeFeedback
      onPress={() => {
        navigation.closeDrawer()

        if (selectedMedia?.id !== playerState.media.id) {
          setLoadingImage(playerState.media.book.imagePath)
          setTimeout(() => {
            loadMedia(playerState.media.id, playerState.media.book.imagePath)
          }, 500)
        }
      }}
    >
      <View style={tw`p-4 py-2 flex-row`}>
        <View style={tw`w-1/4 bg-gray-800`}>
          <Image
            source={source(playerState.media.book.imagePath)}
            style={tw.style('rounded-md', 'w-full', {
              aspectRatio: 10 / 15.5
            })}
          />
        </View>
        <View style={tw`pl-2 w-3/4`}>
          <Text
            style={tw`mb-1 text-base leading-tight font-bold text-gray-100`}
          >
            {playerState.media.book.title}
          </Text>
          <WrappingList
            items={playerState.media.book.authors}
            style={tw`leading-tight text-sm text-gray-400`}
          />
          <Text style={tw`text-lime-400`}>
            {progressPercent(playerState.media.duration, playerState.position)}
          </Text>
        </View>
      </View>
    </TouchableNativeFeedback>
  )
}

const PlayerStateList = ({ navigation }) => {
  const { bottom } = useSafeAreaInsets()
  const showDebugOptions = __DEV__
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = usePlayerStates()

  const { logout } = useLogoutAction()

  const clearMediaAndNavigate = useCallback(() => {
    destroy()
    navigation.navigate('Player')
  }, [navigation])

  const clearMediaAndSignOut = useCallback(() => {
    destroy()
    logout()
  }, [logout])

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  useRefreshOnDrawerOpen(refetch)

  if (isLoading) {
    return (
      <ScreenCentered>
        <LargeActivityIndicator />
      </ScreenCentered>
    )
  }

  if (isError) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-200`}>Failed to load recent books!</Text>
      </ScreenCentered>
    )
  }

  const playerStates = data.pages.flatMap(page =>
    page.playerStates.edges.map(edge => edge.node)
  )

  return (
    <FlatList
      style={tw`mx-2 py-2 rounded-t-xl bg-gray-800`}
      data={playerStates}
      keyExtractor={item => item.media.id}
      onEndReached={loadMore}
      renderItem={({ item }) => (
        <PlayerStateItem playerState={item} navigation={navigation} />
      )}
      ListFooterComponent={
        <View style={[tw`py-2`, { paddingBottom: 56 + bottom }]}>
          {showDebugOptions && (
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
          {isFetchingNextPage && <LargeActivityIndicator />}
        </View>
      }
    />
  )
}

export default function LeftDrawerContents({ navigation }) {
  return (
    <SafeAreaView edges={['left', 'top', 'right']}>
      <PlayerStateList navigation={navigation} />
    </SafeAreaView>
  )
}
