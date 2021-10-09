const types = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: book => ({
    type: types.SUCCESS,
    payload: { book }
  })
}

export const initialState = {
  loading: false,
  error: false,
  book: null
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
        book: action.payload.book
      }
    case types.FAILURE:
      return { ...state, loading: false, error: true }
  }
}
