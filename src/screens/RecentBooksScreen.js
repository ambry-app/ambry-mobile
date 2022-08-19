import React from 'react'
import { Button, Text, View } from 'react-native'
import BookGrid from '../components/BookGrid'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import { useRefreshOnFocus } from '../hooks/refetchOnFocus'
import tw from '../lib/tailwind'
import { useBooks } from '../stores/AmbryAPI'

export default function RecentBooksScreen() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = useBooks()

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  useRefreshOnFocus(refetch)

  if (isLoading) {
    return (
      <ScreenCentered>
        <LargeActivityIndicator />
      </ScreenCentered>
    )
  }

  if (isError) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-200 mb-4`}>Failed to load books!</Text>
        <Button title="Retry" color={tw.color('lime-500')} onPress={refetch} />
      </ScreenCentered>
    )
  }

  const books = data.pages.flatMap(page =>
    page.books.edges.map(edge => edge.node)
  )

  return (
    <BookGrid
      books={books}
      onEndReached={loadMore}
      ListFooterComponent={
        <View style={tw`h-14`}>
          {isFetchingNextPage && <LargeActivityIndicator />}
        </View>
      }
    />
  )
}
