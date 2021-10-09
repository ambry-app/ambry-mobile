import React, { useEffect, useReducer, useCallback } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import tw from '../lib/tailwind'

import { getRecentBooks } from '../api/ambry'
import { actionCreators, initialState, reducer } from '../reducers/books'
import BookGrid from '../components/BookGrid'

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
        <View style={tw.style('items-center justify-center', { flex: 1 })}>
          <ActivityIndicator animating={true} />
        </View>
      )
    }

    if (error) {
      return (
        <View style={tw.style('items-center justify-center', { flex: 1 })}>
          <Text>Failed to load books!</Text>
        </View>
      )
    }
  }

  return <BookGrid numColumns={2} books={books} onEndReached={fetchBooks} />
}
