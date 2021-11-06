import { uriSource } from '../api/ambry'

const types = {
  LOADING: 'LOADING',
  LOADING_TRACK: 'LOADING_TRACK',
  LOADED: 'LOADED',
  FAILURE: 'FAILURE',
  EMPTY: 'EMPTY',
  TRACK_PLAYER_READY: 'TRACK_PLAYER_READY',
  SET_PLAYBACK_RATE: 'SET_PLAYBACK_RATE'
}

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  loadingTrack: loading => ({ type: types.LOADING_TRACK, payload: loading }),
  failure: () => ({ type: types.FAILURE }),
  loaded: (playerState, authData) => ({
    type: types.LOADED,
    payload: { playerState, authData }
  }),
  empty: () => ({ type: types.EMPTY }),
  trackPlayerReady: () => ({ type: types.TRACK_PLAYER_READY }),
  setPlaybackRate: newPlaybackRate => ({
    type: types.SET_PLAYBACK_RATE,
    payload: newPlaybackRate
  })
}

export const initialState = {
  loading: false,
  error: false,
  playerState: undefined,
  media: undefined,
  imageSource: undefined,
  trackPlayerReady: false,
  loadingTrack: false,
  playbackRate: undefined
}

export function reducer (state, action) {
  switch (action.type) {
    case types.LOADING:
      return { ...state, loading: true, error: false }
    case types.LOADING_TRACK:
      return { ...state, loadingTrack: action.payload }
    case types.LOADED:
      const { authData, playerState } = action.payload

      return {
        ...state,
        loading: false,
        error: false,
        playerState: playerState,
        media: playerState.media,
        imageSource: uriSource(authData, playerState.media.book.imagePath),
        playbackRate: playerState.playbackRate
      }
    case types.EMPTY:
      return {
        ...state,
        loading: false,
        error: false,
        playerState: null,
        media: null,
        imageSource: null,
        playbackRate: null
      }
    case types.FAILURE:
      return { ...state, loading: false, error: true }
    case types.TRACK_PLAYER_READY:
      return { ...state, trackPlayerReady: true }
    case types.SET_PLAYBACK_RATE:
      return { ...state, playbackRate: action.payload }
  }
}
