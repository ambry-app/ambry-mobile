/**
 * @format
 */

import 'react-native-gesture-handler'
import { AppRegistry } from 'react-native'
import TrackPlayer from 'react-native-track-player'

import App from './src/App'
import { name as appName } from './app.json'

import PlaybackService from './src/services/playerService'
import SleepTimerTask from './src/tasks/SleepTimerTask'

AppRegistry.registerComponent(appName, () => App)
AppRegistry.registerHeadlessTask('SleepTimerTask', () => SleepTimerTask)
TrackPlayer.registerPlaybackService(() => PlaybackService)
