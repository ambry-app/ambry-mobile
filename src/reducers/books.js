const types = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: (books, page) => ({
    type: types.SUCCESS,
    payload: { books, page }
  })
}

export const initialState = {
  loading: false,
  error: false,
  books: [],
  nextPage: 1,
  hasMore: true
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
        books: [...state.books, ...action.payload.books],
        nextPage: state.nextPage + 1,
        hasMore: action.payload.books.length > 0
      }
    case types.FAILURE:
      return { ...state, loading: false, error: true }
  }
}
