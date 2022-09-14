import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
import Grid from '../components/Grid'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import SafeBottomBorder from '../components/SafeBottomBorder'
import ScreenCentered from '../components/ScreenCentered'
import WrappingListOfLinks from '../components/WrappingListOfLinks'
import { useRefreshOnFocus } from '../hooks/refetchOnFocus'
import tw from '../lib/tailwind'
import { useSeries, useSeriesBooks } from '../stores/AmbryAPI'

export default function SeriesScreen({ navigation, route }) {
  const { data: seriesData, refetch: seriesRefetch } = useSeries(
    route.params.seriesId
  )

  const series = seriesData?.node

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = useSeriesBooks(route.params.seriesId)

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  useRefreshOnFocus(seriesRefetch)
  useRefreshOnFocus(refetch)

  useEffect(() => {
    if (series) {
      navigation.setOptions({ title: series.name })
    }
  }, [navigation, series])

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
        <Text style={tw`text-gray-200`}>Failed to load series!</Text>
      </ScreenCentered>
    )
  }

  const seriesBooks = data.pages.flatMap(page =>
    page.node.seriesBooks.edges.map(edge => edge.node)
  )

  const allAuthors = seriesBooks?.flatMap(seriesBook => seriesBook.book.authors)
  const uniqueAuthors = [
    ...new Map(allAuthors.map(author => [author.id, author])).values()
  ]

  return (
    <SafeBottomBorder>
      <Grid
        books={seriesBooks}
        onEndReached={loadMore}
        itemType="seriesBook"
        ListHeaderComponent={
          <View style={tw`m-2`}>
            <WrappingListOfLinks
              prefix="by"
              items={uniqueAuthors}
              onPressLink={author =>
                navigation.push('Person', { personId: author.person.id })
              }
              style={tw`leading-none text-lg text-gray-200`}
              linkStyle={tw`leading-none text-lg text-gray-200`}
            />
          </View>
        }
        ListFooterComponent={
          <View style={tw`h-14`}>
            {isFetchingNextPage && <LargeActivityIndicator />}
          </View>
        }
      />
    </SafeBottomBorder>
  )
}
