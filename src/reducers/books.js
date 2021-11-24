const types = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  REFRESH: 'REFRESH'
}

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: (books, page, hasMore, reset = false) => ({
    type: types.SUCCESS,
    payload: { books, page, hasMore, reset }
  }),
  refresh: () => ({ type: types.REFRESH })
}

export const initialState = {
  loading: false,
  refreshing: false,
  error: false,
  books: [],
  nextPage: 1,
  hasMore: true
}

export function reducer(state, action) {
  switch (action.type) {
    case types.LOADING:
      return { ...state, loading: true, error: false }
    case types.SUCCESS:
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: false,
        books: action.payload.reset
          ? action.payload.books
          : [...state.books, ...action.payload.books],
        nextPage: state.nextPage + 1,
        hasMore: action.payload.hasMore
      }
    case types.FAILURE:
      return { ...state, loading: false, refreshing: false, error: true }
    case types.REFRESH:
      return { ...state, nextPage: 1, refreshing: true }
  }
}
