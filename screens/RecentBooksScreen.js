import React, { useEffect, useReducer, useCallback } from 'react'
import { Text } from 'react-native'

import BookGrid from '../components/BookGrid'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'

import { getRecentBooks } from '../api/ambry'
import { actionCreators, initialState, reducer } from '../reducers/books'

export default function RecentBooksScreen () {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { books, nextPage, loading, error } = state

  const fetchBooks = useCallback(async () => {
    dispatch(actionCreators.loading())

    try {
      const nextBooks = await getRecentBooks(nextPage)
      dispatch(actionCreators.success(nextBooks, nextPage))
    } catch (e) {
      dispatch(actionCreators.failure())
    }
  }, [nextPage])

  useEffect(() => {
    fetchBooks()
  }, [])

  // We'll show an error only if the first page fails to load
  if (books.length === 0) {
    if (loading) {
      return (
        <ScreenCentered>
          <LargeActivityIndicator />
        </ScreenCentered>
      )
    }

    if (error) {
      return (
        <ScreenCentered>
          <Text>Failed to load books!</Text>
        </ScreenCentered>
      )
    }
  }

  return <BookGrid books={books} onEndReached={fetchBooks} />
}
