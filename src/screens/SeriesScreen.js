import React, { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import BookGrid from '../components/BookGrid'
import { Header1 } from '../components/Headers'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import SafeBottomBorder from '../components/SafeBottomBorder'
import ScreenCentered from '../components/ScreenCentered'
import WrappingListOfLinks from '../components/WrappingListOfLinks'
import { useRefreshOnFocus } from '../hooks/refetchOnFocus'
import tw from '../lib/tailwind'
import { actionCreators, initialState, reducer } from '../reducers/series'
import { getSeries, useSeries, useSeriesBooks } from '../stores/AmbryAPI'

export default function SeriesScreen({ navigation, route }) {
  // const [state, dispatch] = useReducer(reducer, initialState)

  // const { series, loading, error } = state

  // const fetchSeries = useCallback(async () => {
  //   dispatch(actionCreators.loading())

  //   try {
  //     const loadedSeries = await getSeries(route.params.seriesId)
  //     dispatch(actionCreators.success(loadedSeries))
  //   } catch {
  //     dispatch(actionCreators.failure())
  //   }
  // }, [route.params.seriesId])

  // useEffect(() => {
  //   fetchSeries()
  // }, [fetchSeries, route.params.seriesId])

  const { data: seriesData } = useSeries(route.params.seriesId)

  const series = seriesData?.node

  const [refreshing, setRefreshing] = useState(false)

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = useSeriesBooks(route.params.seriesId)

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
      <BookGrid
        books={seriesBooks}
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
      />
    </SafeBottomBorder>
  )
}
