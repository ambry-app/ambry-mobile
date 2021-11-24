const types = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: person => ({
    type: types.SUCCESS,
    payload: { person }
  })
}

export const initialState = {
  loading: false,
  error: false,
  person: null
}

export function reducer(state, action) {
  switch (action.type) {
    case types.LOADING:
      return { ...state, loading: true, error: false }
    case types.SUCCESS:
      return {
        ...state,
        loading: false,
        error: false,
        person: action.payload.person
      }
    case types.FAILURE:
      return { ...state, loading: false, error: true }
  }
}
