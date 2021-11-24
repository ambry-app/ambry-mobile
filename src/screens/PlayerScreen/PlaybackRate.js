import Slider from '@react-native-community/slider'
import React, { memo, useEffect, useState } from 'react'
import {
  Button,
  Modal,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native'
import { Header4 } from '../../components/Headers'
import ScreenCentered from '../../components/ScreenCentered'
import { usePlayer } from '../../contexts/Player'
import tw from '../../lib/tailwind'

function formatPlaybackRate(rate) {
  if (!rate) {
    return '1.0'
  }
  if (Number.isInteger(rate)) {
    return rate + '.0'
  } else {
    return rate.toString()
  }
}

export default function PlaybackRate() {
  const { state, actions } = usePlayer()
  const { playbackRate } = state
  const { setPlaybackRate } = actions

  return (
    <ActualPlaybackRate
      playbackRate={playbackRate}
      setPlaybackRate={setPlaybackRate}
    />
  )
}

const ActualPlaybackRate = memo(({ playbackRate, setPlaybackRate }) => {
  // console.log('RENDERING: PlaybackRate')
  const [rateModalVisible, setRateModalVisible] = useState(false)
  const [displayPlaybackRate, setDisplayPlaybackRate] = useState()
  const scheme = useColorScheme()

  useEffect(() => {
    setDisplayPlaybackRate(playbackRate)
  }, [playbackRate])

  return (
    <>
      <Modal
        animationType="fade"
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
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-400 rounded-md`}
                  >
                    1.0x
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaybackRate(1.25)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-400 rounded-md`}
                  >
                    1.25x
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaybackRate(1.5)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-400 rounded-md`}
                  >
                    1.5x
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaybackRate(1.75)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-400 rounded-md`}
                  >
                    1.75x
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaybackRate(2.0)}>
                  <Text
                    style={tw`text-gray-700 dark:text-gray-200 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-400 rounded-md`}
                  >
                    2.0x
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={tw`flex-row-reverse bg-gray-100 dark:bg-gray-700 p-4`}>
              <Button
                title="Ok"
                color={tw.color('lime-500')}
                onPress={() => setRateModalVisible(!rateModalVisible)}
              />
            </View>
          </View>
        </ScreenCentered>
      </Modal>
      <TouchableOpacity onPress={() => setRateModalVisible(true)}>
        <Text
          style={tw`py-1 px-2 text-gray-700 dark:text-gray-400 text-sm tabular-nums border border-gray-400 dark:border-gray-400 rounded-lg`}
        >
          {formatPlaybackRate(playbackRate)}x
        </Text>
      </TouchableOpacity>
    </>
  )
})
