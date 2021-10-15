import React, { useEffect, useReducer, useCallback } from 'react'
import { Text, View } from 'react-native'

import { useAuth } from '../contexts/Auth'

import BookGrid from '../components/BookGrid'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'

import tw from '../lib/tailwind'

import { getRecentBooks } from '../api/ambry'
import { actionCreators, initialState, reducer } from '../reducers/books'

export default function RecentBooksScreen () {
  const { signOut, authData } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  const { books, nextPage, hasMore, loading, error } = state

  const fetchBooks = useCallback(async () => {
    if (loading || !hasMore) {
      return
    }

    dispatch(actionCreators.loading())

    try {
      const nextBooks = await getRecentBooks(authData, nextPage)
      dispatch(actionCreators.success(nextBooks, nextPage))
    } catch (status) {
      if (status == 401) {
        await signOut()
      } else {
        dispatch(actionCreators.failure())
      }
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
          <Text style={tw`text-gray-700 dark:text-gray-200`}>
            Failed to load books!
          </Text>
        </ScreenCentered>
      )
    }
  }

  return (
    <BookGrid
      books={books}
      onEndReached={fetchBooks}
      ListFooterComponent={
        <View style={tw`h-14`}>{loading && <LargeActivityIndicator />}</View>
      }
    />
  )
}
