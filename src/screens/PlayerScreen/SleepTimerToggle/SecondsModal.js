import Slider from '@react-native-community/slider'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Modal,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native'
import ScreenCentered from '../../../components/ScreenCentered'
import tw from '../../../lib/tailwind'

function formatSeconds(seconds) {
  return Math.round(seconds / 60)
}

export default function SecondsModal({
  visible,
  countdownSeconds,
  onNewValue,
  onRequestClose
}) {
  const scheme = useColorScheme()
  const [seconds, setSeconds] = useState()
  const [displaySeconds, setDisplaySeconds] = useState()

  const setNewSeconds = value => {
    setSeconds(value)
    setDisplaySeconds(value)
  }

  useEffect(() => {
    setNewSeconds(countdownSeconds)
  }, [countdownSeconds])

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <ScreenCentered>
        <View
          style={tw`shadow-lg bg-white dark:bg-gray-800 rounded-lg w-11/12 overflow-hidden`}
        >
          <View style={tw`p-4`}>
            <Text
              style={tw`text-xl text-gray-700 dark:text-gray-100 font-bold`}
            >
              Sleep Timer
            </Text>
            <Text
              style={tw`m-4 text-gray-700 dark:text-gray-100 text-lg text-center`}
            >
              {formatSeconds(displaySeconds)}m
            </Text>
            <Slider
              style={tw`my-4`}
              value={seconds}
              minimumValue={300}
              maximumValue={5400}
              step={300}
              thumbTintColor={
                scheme === 'dark' ? tw.color('lime-400') : tw.color('lime-500')
              }
              minimumTrackTintColor={
                scheme === 'dark' ? tw.color('gray-400') : tw.color('gray-200')
              }
              maximumTrackTintColor={
                scheme === 'dark' ? tw.color('gray-400') : tw.color('gray-200')
              }
              onValueChange={value => {
                setDisplaySeconds(parseFloat(value.toFixed(2)))
              }}
              onSlidingComplete={value => {
                setSeconds(value)
              }}
            />
            <View style={tw`flex-row justify-between my-4`}>
              <TouchableOpacity onPress={() => setNewSeconds(300)}>
                <Text
                  style={tw`text-gray-700 dark:text-gray-100 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-500 rounded-md`}
                >
                  5m
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNewSeconds(600)}>
                <Text
                  style={tw`text-gray-700 dark:text-gray-100 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-500 rounded-md`}
                >
                  10m
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNewSeconds(900)}>
                <Text
                  style={tw`text-gray-700 dark:text-gray-100 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-500 rounded-md`}
                >
                  15m
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNewSeconds(1800)}>
                <Text
                  style={tw`text-gray-700 dark:text-gray-100 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-500 rounded-md`}
                >
                  30m
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNewSeconds(3600)}>
                <Text
                  style={tw`text-gray-700 dark:text-gray-100 text-center py-1 px-2 w-14 border border-gray-300 dark:border-gray-500 rounded-md`}
                >
                  60m
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={tw`flex-row-reverse bg-gray-100 dark:bg-gray-700 p-4`}>
            <Button
              title="Ok"
              color={tw.color('lime-500')}
              onPress={() => {
                onNewValue(seconds)
                onRequestClose()
              }}
            />
          </View>
        </View>
      </ScreenCentered>
    </Modal>
  )
}
