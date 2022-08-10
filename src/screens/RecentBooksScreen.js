import { useInfiniteQuery } from '@tanstack/react-query'
import React from 'react'
import { Button, Text, View } from 'react-native'
import BookGrid from '../components/BookGrid'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import SafeBottomBorder from '../components/SafeBottomBorder'
import ScreenCentered from '../components/ScreenCentered'
import { useRefreshOnFocus } from '../hooks/refetchOnFocus'
import tw from '../lib/tailwind'
import { fetchBooks } from '../stores/AmbryAPI'

export default function RecentBooksScreen() {
  const [refreshing, setRefreshing] = React.useState(false)

  const {
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    data
  } = useInfiniteQuery(['books'], fetchBooks, {
    getNextPageParam: lastPage => {
      if (lastPage?.pageInfo?.hasNextPage) {
        return lastPage.pageInfo.endCursor
      }
    }
  })

  useRefreshOnFocus(refetch)

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

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
        <Text style={tw`text-gray-700 dark:text-gray-200 mb-4`}>
          Failed to load books!
        </Text>
        <Button title="Retry" color={tw.color('lime-500')} onPress={refetch} />
      </ScreenCentered>
    )
  }

  const books = data.pages.map(page => page.edges.map(edge => edge.node)).flat()

  return (
    <SafeBottomBorder>
      <BookGrid
        books={books}
        onEndReached={loadMore}
        onRefresh={refresh}
        refreshing={refreshing}
        ListFooterComponent={
          <View style={tw`h-14`}>
            {isFetchingNextPage && <LargeActivityIndicator />}
          </View>
        }
      />
    </SafeBottomBorder>
  )
}
