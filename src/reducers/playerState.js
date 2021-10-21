const types = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: playerState => ({
    type: types.SUCCESS,
    payload: { playerState }
  })
}

export const initialState = {
  loading: false,
  error: false,
  playerState: undefined
}

export function reducer (state, action) {
  switch (action.type) {
    case types.LOADING:
      return { ...state, loading: true, error: false }
    case types.SUCCESS:
      return {
        ...state,
        loading: false,
        error: false,
        playerState: action.payload.playerState
      }
    case types.FAILURE:
      return { ...state, loading: false, error: true }
  }
}
