import React, { useEffect, useReducer, useCallback, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
  TrackType
} from 'react-native-track-player'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useAuth } from '../contexts/Auth'

import tw from '../lib/tailwind'

import { Header2 } from '../components/Headers'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import Play from '../assets/play.svg'
import Pause from '../assets/pause.svg'

import { getPlayerState, imageSource, reportPlayerState } from '../api/ambry'
import { actionCreators, initialState, reducer } from '../reducers/playerState'
import WrappingListOfLinks from '../components/WrappingListOfLinks'

const togglePlayback = async playbackState => {
  const currentTrack = await TrackPlayer.getCurrentTrack()

  if (currentTrack == null) {
  } else {
    if (playbackState !== State.Playing) {
      await TrackPlayer.play()
    } else {
      await TrackPlayer.pause()
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
    position,
    playbackRate
  })
}

export default function PlayerScreen ({ navigation, route }) {
  const { signOut, authData } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { playerState, loading, error } = state
  const playbackState = usePlaybackState()
  const progress = useProgress()
  const [progressDisplay, setProgressDisplay] = useState()

  const fetchPlayerState = useCallback(async () => {
    dispatch(actionCreators.loading())

    try {
      const playerState = await getPlayerState(authData, route.params.mediaId)

      const { uri: mpdUrl, headers } = imageSource(
        authData,
        playerState.media.mpdPath
      )
      const { uri: artworkUrl } = imageSource(
        authData,
        playerState.media.book.imagePath
      )

      await AsyncStorage.setItem(mpdUrl, JSON.stringify(playerState))

      const track = await TrackPlayer.getTrack(0)

      if (track && track.url === mpdUrl) {
        dispatch(actionCreators.success(playerState))
      } else {
        await reportPreviousTrackState(authData, track.url)

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
        await TrackPlayer.setRate(playerState.playbackRate)
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
  }, [route.params.mediaId])

  useEffect(() => {
    fetchPlayerState()
  }, [])

  useEffect(() => {
    const { duration: durationSeconds, position: positionSeconds } = progress
    const percent = ((positionSeconds / durationSeconds) * 100).toFixed(1) + '%'
    const position =
      positionSeconds < 3600
        ? new Date(positionSeconds * 1000).toISOString().substr(14, 5)
        : new Date(positionSeconds * 1000).toISOString().substr(11, 8)

    const duration = new Date(durationSeconds * 1000)
      .toISOString()
      .substr(11, 8)
    const remainingSeconds = durationSeconds - positionSeconds
    const remaining = new Date(remainingSeconds * 1000)
      .toISOString()
      .substr(11, 8)

    setProgressDisplay({ percent, position, duration, remaining })
  }, [progress])

  if (!playerState) {
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
          <Text style={tw`text-gray-700`}>Failed to load player!</Text>
        </ScreenCentered>
      )
    }
  } else {
    return (
      <>
        <View style={tw`p-4 flex-row`}>
          <View
            style={tw`w-1/4 rounded-xl border-gray-200 bg-gray-200 shadow-md`}
          >
            <Image
              source={imageSource(authData, playerState.media.book.imagePath)}
              style={tw.style('rounded-xl', 'w-full', {
                aspectRatio: 10 / 15
              })}
            />
          </View>
          <View style={tw`pl-4`}>
            <TouchableOpacity
              onPress={() =>
                navigation.push('Book', { bookId: playerState.media.book.id })
              }
            >
              <Header2>{playerState.media.book.title}</Header2>
            </TouchableOpacity>
            <WrappingListOfLinks
              prefix='by'
              items={playerState.media.book.authors}
              navigationArgsExtractor={author => [
                'Person',
                { personId: author.personId }
              ]}
              style={tw`text-lg text-gray-500`}
              linkStyle={tw`text-lg text-lime-500`}
            />
            <WrappingListOfLinks
              prefix='Narrated by'
              items={playerState.media.narrators}
              keyExtractor={narrator => narrator.personId}
              navigationArgsExtractor={narrator => [
                'Person',
                { personId: narrator.personId }
              ]}
              style={tw`text-gray-500`}
              linkStyle={tw`text-lime-500`}
            />
            <WrappingListOfLinks
              items={playerState.media.book.series}
              navigationArgsExtractor={series => [
                'Series',
                { seriesId: series.id }
              ]}
              nameExtractor={series => `${series.name} #${series.bookNumber}`}
              style={tw`text-gray-400`}
              linkStyle={tw`text-gray-400`}
            />
          </View>
        </View>
        <View style={tw`p-4`}>
          <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
            <View
              style={tw.style('h-2 bg-lime-500', {
                width: progressDisplay.percent
              })}
            ></View>
          </View>
          <View style={tw`flex-row justify-between`}>
            <Text style={tw`text-gray-500 text-sm tabular-nums`}>
              {progressDisplay.position} of {progressDisplay.duration}
            </Text>
            <Text style={tw`text-gray-500 text-sm tabular-nums`}>
              {progressDisplay.percent}
            </Text>
            <Text style={tw`text-gray-500 text-sm tabular-nums`}>
              {progressDisplay.remaining}
            </Text>
          </View>
        </View>
        <ScreenCentered>
          <TouchableOpacity onPress={() => togglePlayback(playbackState)}>
            {playbackState === State.Playing ? (
              <Pause width={75} height={75} />
            ) : (
              <Play width={75} height={75} />
            )}
          </TouchableOpacity>
        </ScreenCentered>
      </>
    )
  }

  return null
}
