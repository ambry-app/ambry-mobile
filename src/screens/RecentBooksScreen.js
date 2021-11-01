import React, { useCallback, useEffect, useReducer } from 'react'
import { Text, View } from 'react-native'
import { getRecentBooks } from '../api/ambry'
import BookGrid from '../components/BookGrid'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import { useAuth } from '../contexts/Auth'
import tw from '../lib/tailwind'
import { actionCreators, initialState, reducer } from '../reducers/books'

export default function RecentBooksScreen () {
  const { signOut, authData } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  const { books, nextPage, hasMore, loading, refreshing, error } = state

  const fetchBooks = useCallback(async () => {
    if (!hasMore) {
      return
    }

    dispatch(actionCreators.loading())

    try {
      const [nextBooks, hasMore] = await getRecentBooks(authData, nextPage)
      dispatch(actionCreators.success(nextBooks, nextPage, hasMore))
    } catch (status) {
      if (status == 401) {
        await signOut()
      } else {
        dispatch(actionCreators.failure())
      }
    }
  }, [hasMore, nextPage])

  const refreshBooks = useCallback(async () => {
    dispatch(actionCreators.refresh())

    try {
      const [nextBooks, hasMore] = await getRecentBooks(authData, 1)
      dispatch(actionCreators.success(nextBooks, 1, hasMore, true))
    } catch (status) {
      if (status == 401) {
        await signOut()
      } else {
        dispatch(actionCreators.failure())
      }
    }
  }, [])

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
      onRefresh={refreshBooks}
      refreshing={refreshing}
      ListFooterComponent={
        <View style={tw`h-14`}>{loading && <LargeActivityIndicator />}</View>
      }
    />
  )
}
