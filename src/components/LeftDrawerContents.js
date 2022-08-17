import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React, { useCallback } from 'react'
import { Button, Image, Text, View } from 'react-native'
import { FlatList, TouchableNativeFeedback } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import LargeActivityIndicator from './LargeActivityIndicator'
import ScreenCentered from './ScreenCentered'
import tw from '../lib/tailwind'
import { progressPercent } from '../lib/utils'
import { uriSource, useLogoutAction, usePlayerStates } from '../stores/AmbryAPI'
import usePlayer, {
  destroy,
  loadMedia,
  setLoadingImage
} from '../stores/Player'
import WrappingList from './WrappingList'
import { useRefreshOnDrawerOpen } from '../hooks/refetchOnDrawerOpen'

function Item({ playerState, navigation }) {
  const selectedMedia = usePlayer(state => state.selectedMedia)

  return (
    <TouchableNativeFeedback
      onPress={() => {
        navigation.navigate('Player')

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
            source={uriSource(playerState.media.book.imagePath)}
            style={tw.style('rounded-md', 'w-full', {
              aspectRatio: 10 / 15
            })}
          />
        </View>
        <View style={tw`pl-2 w-3/4`}>
          <Text style={tw`text-lg leading-tight font-bold text-gray-100`}>
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

export default function LeftDrawerContents({ navigation }) {
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
    <SafeAreaView>
      <View style={tw`flex-row h-full`}>
        <View style={tw`p-4`}>
          <NavigationIcon
            onPress={() => {
              navigation.navigate('Player')
            }}
            icon="circle-play"
            active={true}
          />
          <View style={tw`h-4`} />
          <NavigationIcon
            onPress={() => {
              navigation.navigate('Recent')
            }}
            icon="book-open"
          />
          <View style={tw`h-4`} />
          <NavigationIcon
            onPress={() => {
              navigation.navigate('Search')
            }}
            icon="magnifying-glass"
          />
          <View style={tw`h-4`} />
          <NavigationIcon
            onPress={() => {
              navigation.navigate('Settings')
            }}
            icon="gear"
          />
        </View>
        <FlatList
          style={tw`mr-2 pb-2 rounded-xl bg-gray-800`}
          data={playerStates}
          keyExtractor={item => item.id}
          onEndReached={loadMore}
          renderItem={({ item }) => (
            <Item playerState={item} navigation={navigation} />
          )}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View style={tw`px-4 pt-2 rounded-t-xl bg-gray-800 shadow-lg`}>
              <Text style={tw`mb-1 text-xl font-bold text-gray-100`}>
                Recent
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={__DEV__ ? tw`h-22` : tw`h-2`}>
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
              {isFetchingNextPage && <LargeActivityIndicator />}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

function NavigationIcon({ onPress, icon, active = false }) {
  return (
    <TouchableNativeFeedback
      onPress={onPress}
      background={TouchableNativeFeedback.Ripple(tw.color('gray-400'), true)}
    >
      <FontAwesomeIcon
        icon={icon}
        size={32}
        color={active ? tw.color('lime-400') : 'white'}
      />
    </TouchableNativeFeedback>
  )
}
