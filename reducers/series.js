const types = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: series => ({
    type: types.SUCCESS,
    payload: { series }
  })
}

export const initialState = {
  loading: false,
  error: false,
  series: null
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
        series: action.payload.series
      }
    case types.FAILURE:
      return { ...state, loading: false, error: true }
  }
}
