import React, { useEffect, useReducer, useCallback, useState } from 'react'
import {
  Button,
  Image,
  ImageBackground,
  Modal,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native'
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
  TrackType
} from 'react-native-track-player'
import Slider from '@react-native-community/slider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StackActions } from '@react-navigation/native'

import { useAuth } from '../contexts/Auth'

import tw from '../lib/tailwind'

import { Header2, Header4 } from '../components/Headers'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import PlayButton from '../components/PlayButton'
import PauseButton from '../components/PauseButton'
import Back10Button from '../components/Back10Button'
import Forward10Button from '../components/Forward10Button'
import BackButton from '../components/BackButton'
import ForwardButton from '../components/ForwardButton'

import { getPlayerState, imageSource, reportPlayerState } from '../api/ambry'
import { actionCreators, initialState, reducer } from '../reducers/playerState'
import WrappingListOfLinks from '../components/WrappingListOfLinks'
import { secondsDisplay, progressPercent } from '../lib/utils'

const togglePlayback = async (playbackState, playerState, authData) => {
  const currentTrack = await TrackPlayer.getCurrentTrack()

  if (currentTrack == null) {
  } else {
    if (playbackState !== State.Playing) {
      await TrackPlayer.play()
    } else {
      await TrackPlayer.pause()
      seekRelative(-1, playerState, authData)
    }
  }
}

const reportPreviousTrackState = async (authData, trackUrl) => {
  const previousPlayerStateString = await AsyncStorage.getItem(trackUrl)
  const { id } = JSON.parse(previousPlayerStateString)
  const position = await TrackPlayer.getPosition()
  const playbackRate = await TrackPlayer.getRate()

  await reportPlayerState(authData, {
    id,
    position: position.toFixed(3),
    playbackRate: playbackRate.toFixed(2)
  })
}

async function sendState (playerState, authData) {
  const { uri: mpdUrl } = imageSource(authData, playerState.media.mpdPath)

  const position = await TrackPlayer.getPosition()
  const playbackRate = await TrackPlayer.getRate()

  const playerStateReport = {
    id: playerState.id,
    position: position.toFixed(3),
    playbackRate: playbackRate.toFixed(2)
  }

  await reportPlayerState(authData, playerStateReport)

  const updatedPlayerState = {
    position,
    playbackRate,
    ...playerState
  }

  await AsyncStorage.setItem(mpdUrl, JSON.stringify(updatedPlayerState))
}

async function seekRelative (interval, playerState, authData) {
  const position = await TrackPlayer.getPosition()
  const duration = await TrackPlayer.getDuration()
  const playbackRate = await TrackPlayer.getRate()
  const actualInterval = interval * playbackRate
  const targetDestination = position + actualInterval
  const actualDestination = Math.max(Math.min(targetDestination, duration), 0)

  await TrackPlayer.seekTo(actualDestination)

  await sendState(playerState, authData)
}

function formatPlaybackRate (rate) {
  if (!rate) {
    return '1.0'
  }
  if (Number.isInteger(rate)) {
    return rate + '.0'
  } else {
    return rate.toString()
  }
}

export default function PlayerScreen ({ navigation, route }) {
  const { signOut, authData } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { playerState, loading, error } = state
  const playbackState = usePlaybackState()
  const progress = useProgress()
  const [progressDisplay, setProgressDisplay] = useState()
  const [rateModalVisible, setRateModalVisible] = useState(false)
  const [playbackRate, setPlaybackRate] = useState()
  const [displayPlaybackRate, setDisplayPlaybackRate] = useState()
  const scheme = useColorScheme()
  const mediaIdParam = route?.params?.mediaId

  // report progress every 1 minute, at least while this screen is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (playbackState === State.Playing) {
        sendState(playerState, authData)
      }
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [playbackState])

  const fetchPlayerState = useCallback(async () => {
    dispatch(actionCreators.loading())

    let mediaId

    if (route.params && route.params.mediaId) {
      mediaId = route.params.mediaId
    } else {
      // We're coming from the notification deep link or the tab navigator.
      // In this case, we should try restoring the state from whatever was last
      // loaded.
      const trackUrl = await AsyncStorage.getItem('lastLoadedUrl')
      if (!trackUrl) {
        dispatch(actionCreators.success(null))
        return
      }
      const playerStateString = await AsyncStorage.getItem(trackUrl)
      const playerState = JSON.parse(playerStateString)

      mediaId = playerState.media.id
    }

    try {
      const playerState = await getPlayerState(authData, mediaId)

      const { uri: mpdUrl, headers } = imageSource(
        authData,
        playerState.media.mpdPath
      )
      const { uri: artworkUrl } = imageSource(
        authData,
        playerState.media.book.imagePath
      )

      await AsyncStorage.setItem(mpdUrl, JSON.stringify(playerState))
      await AsyncStorage.setItem('lastLoadedUrl', mpdUrl)

      const track = await TrackPlayer.getTrack(0)

      if (track && track.url === mpdUrl) {
        dispatch(actionCreators.success(playerState))
      } else {
        if (track) {
          await reportPreviousTrackState(authData, track.url)
        }

        await TrackPlayer.reset()
        await TrackPlayer.add({
          url: mpdUrl,
          type: TrackType.Dash,
          duration: playerState.media.duration,
          title: playerState.media.book.title,
          artist: playerState.media.book.authors
            .map(author => author.name)
            .join(', '),
          artwork: artworkUrl,
          headers
        })
        await TrackPlayer.seekTo(playerState.position)

        dispatch(actionCreators.success(playerState))
      }
    } catch (status) {
      if (status == 401) {
        await signOut()
      } else {
        dispatch(actionCreators.failure())
      }
    }
  }, [mediaIdParam])

  useEffect(() => {
    fetchPlayerState()
  }, [mediaIdParam])

  useEffect(() => {
    const { duration: durationSeconds, position: positionSeconds } = progress
    const percent = progressPercent(durationSeconds, positionSeconds)
    const position = secondsDisplay(positionSeconds)
    const duration = secondsDisplay(durationSeconds)
    const remainingSeconds = Math.max(durationSeconds - positionSeconds, 0)
    const rate = playbackRate || 1
    const remaining = secondsDisplay(remainingSeconds / rate)

    setProgressDisplay({ percent, position, duration, remaining })
  }, [progress, playbackRate])

  useEffect(() => {
    playerState && setPlaybackRate(playerState.playbackRate)
  }, [playerState])

  useEffect(() => {
    if (playbackRate) {
      TrackPlayer.setRate(playbackRate)
      setDisplayPlaybackRate(playbackRate)
    }
  }, [playbackRate])

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
          Failed to load player!
        </Text>
      </ScreenCentered>
    )
  }

  // it was explicitly set to null; this means there is no current player state
  if (playerState === null) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-700 dark:text-gray-200`}>
          No audiobook selected. Visit the Library to choose a book.
        </Text>
      </ScreenCentered>
    )
  }

  // undefined (must be about to load)
  if (!playerState) {
    return null
  }

  return (
    <ImageBackground
      source={imageSource(authData, playerState.media.book.imagePath)}
      blurRadius={10}
      style={tw.style('h-full', { resizeMode: 'cover' })}
    >
      {/* Playback Speed Modal */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={rateModalVisible}
        onRequestClose={() => {
          setRateModalVisible(!rateModalVisible)
        }}
      >
        <ScreenCentered>
          <View
            style={tw`shadow-lg bg-white dark:bg-gray-800 rounded-lg w-11/12 overflow-hidden`}
          >
            <View style={tw`p-4`}>
              <Header4>Playback Speed</Header4>
              <Text
                style={tw`m-4 text-gray-700 dark:text-gray-200 text-lg text-center`}
              >
                {formatPlaybackRate(displayPlaybackRate)}x
              </Text>
              <Slider
                style={tw`my-4`}
                value={playbackRate}
                minimumValue={0.5}
                maximumValue={3.0}
                step={0.05}
                thumbTintColor={
                  scheme == 'dark' ? tw.color('lime-400') : tw.color('lime-500')
                }
                minimumTrackTintColor={
                  scheme == 'dark' ? tw.color('gray-400') : tw.color('gray-200')
                }
                maximumTrackTintColor={
                  scheme == 'dark' ? tw.color('gray-400') : tw.color('gray-200')
                }
                onValueChange={async value => {
                  setDisplayPlaybackRate(parseFloat(value.toFixed(2)))
                }}
                onSlidingComplete={async value => {
                  setPlaybackRate(parseFloat(value.toFixed(2)))
                }}
              />
              <View style={tw`flex-row justify-between my-4`}>
                <TouchableOpacity onPress={() => setPlaybackRate(1.0)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-200 dark:border-gray-400 rounded-md`}
                  >
                    1.0x
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaybackRate(1.25)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-200 dark:border-gray-400 rounded-md`}
                  >
                    1.25x
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaybackRate(1.5)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-200 dark:border-gray-400 rounded-md`}
                  >
                    1.5x
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaybackRate(1.75)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-200 dark:border-gray-400 rounded-md`}
                  >
                    1.75x
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaybackRate(2.0)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-200 dark:border-gray-400 rounded-md`}
                  >
                    2.0x
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={tw`flex-row-reverse bg-gray-100 dark:bg-gray-700 p-4`}>
              <Button
                title='Ok'
                color={tw.color('lime-500')}
                onPress={() => setRateModalVisible(!rateModalVisible)}
              />
            </View>
          </View>
        </ScreenCentered>
      </Modal>

      {/* Header */}
      <View style={tw`p-4 opacity-85 bg-gray-100 dark:bg-gray-800 shadow-md`}>
        {/* Book Details */}
        <View style={tw`flex-row`}>
          <View style={tw`w-1/4`}>
            <View style={tw`rounded-xl border-gray-200 bg-gray-200 shadow-md`}>
              <Image
                source={imageSource(authData, playerState.media.book.imagePath)}
                style={tw.style('rounded-md', 'w-full', {
                  aspectRatio: 10 / 15
                })}
              />
            </View>
          </View>
          <View style={tw`pl-4 w-3/4`}>
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  StackActions.push('Book', {
                    bookId: playerState.media.book.id
                  })
                )
                navigation.navigate('Library')
              }}
            >
              <Header2>{playerState.media.book.title}</Header2>
            </TouchableOpacity>
            <WrappingListOfLinks
              prefix='by'
              items={playerState.media.book.authors}
              onPressLink={author => {
                navigation.dispatch(
                  StackActions.push('Person', {
                    personId: author.personId
                  })
                )
                navigation.navigate('Library')
              }}
              style={tw`text-lg text-gray-500 dark:text-gray-400`}
              linkStyle={tw`text-lg text-lime-500 dark:text-lime-400`}
            />
            <WrappingListOfLinks
              prefix='Narrated by'
              items={playerState.media.narrators}
              keyExtractor={narrator => narrator.personId}
              onPressLink={narrator => {
                navigation.dispatch(
                  StackActions.push('Person', {
                    personId: narrator.personId
                  })
                )
                navigation.navigate('Library')
              }}
              style={tw`text-gray-500 dark:text-gray-400`}
              linkStyle={tw`text-lime-500 dark:text-lime-400`}
            />
            <WrappingListOfLinks
              items={playerState.media.book.series}
              onPressLink={series => {
                navigation.dispatch(
                  StackActions.push('Series', {
                    seriesId: series.seriesId
                  })
                )
                navigation.navigate('Library')
              }}
              nameExtractor={series => `${series.name} #${series.bookNumber}`}
              style={tw`text-gray-400 dark:text-gray-500`}
              linkStyle={tw`text-gray-400 dark:text-gray-500`}
            />
          </View>
        </View>
        {/* Progress */}
        <View style={tw`my-4`}>
          <View
            style={tw`h-2 bg-gray-200 shadow-md dark:bg-gray-700 rounded-full overflow-hidden`}
          >
            <View
              style={tw.style('h-2 bg-lime-500 dark:bg-lime-400', {
                width: progressDisplay.percent
              })}
            ></View>
          </View>
          <View style={tw`flex-row justify-between`}>
            <Text
              style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}
            >
              {progressDisplay.position} of {progressDisplay.duration}
            </Text>
            <Text
              style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}
            >
              {progressDisplay.percent}
            </Text>
            <Text
              style={tw`text-gray-500 dark:text-gray-400 text-sm tabular-nums`}
            >
              -{progressDisplay.remaining}
            </Text>
          </View>
        </View>
        {/* Playback Speed */}
        <View style={tw`flex-row-reverse`}>
          <TouchableOpacity onPress={() => setRateModalVisible(true)}>
            <Text
              style={tw`py-1 px-2 text-gray-500 dark:text-gray-400 text-sm tabular-nums border border-gray-200 dark:border-gray-400 rounded-lg`}
            >
              {formatPlaybackRate(playbackRate)}x
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Player Controls */}
      <View
        style={tw.style(
          'justify-center opacity-85 bg-white dark:bg-gray-900 mb-12',
          {
            flex: 1
          }
        )}
      >
        <View style={tw`flex-row items-center justify-around px-12 mb-14`}>
          <TouchableOpacity
            onPress={() => seekRelative(-10, playerState, authData)}
          >
            <Back10Button width={34} height={39} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => togglePlayback(playbackState, playerState, authData)}
          >
            {playbackState === State.Playing ? (
              <PauseButton width={75} height={75} />
            ) : (
              <PlayButton width={75} height={75} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => seekRelative(10, playerState, authData)}
          >
            <Forward10Button width={34} height={39} />
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row items-center justify-around px-12`}>
          <TouchableOpacity
            onPress={() => seekRelative(-60, playerState, authData)}
          >
            <BackButton width={42} height={27} />
            <Text style={tw`text-gray-400 text-center`}>1 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => seekRelative(60, playerState, authData)}
          >
            <ForwardButton width={42} height={27} />
            <Text style={tw`text-gray-400 text-center`}>1 min</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}
