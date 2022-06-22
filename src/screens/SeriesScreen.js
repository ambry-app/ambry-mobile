import React, { useCallback, useEffect, useReducer } from 'react'
import { Text, View } from 'react-native'
import BookGrid from '../components/BookGrid'
import { Header1 } from '../components/Headers'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import SafeBottomBorder from '../components/SafeBottomBorder'
import ScreenCentered from '../components/ScreenCentered'
import WrappingListOfLinks from '../components/WrappingListOfLinks'
import tw from '../lib/tailwind'
import { actionCreators, initialState, reducer } from '../reducers/series'
import { getSeries } from '../stores/AmbryAPI'

export default function SeriesScreen({ navigation, route }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { series, loading, error } = state

  const fetchSeries = useCallback(async () => {
    dispatch(actionCreators.loading())

    try {
      const loadedSeries = await getSeries(route.params.seriesId)
      dispatch(actionCreators.success(loadedSeries))
    } catch {
      dispatch(actionCreators.failure())
    }
  }, [route.params.seriesId])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries, route.params.seriesId])

  useEffect(() => {
    if (series) {
      navigation.setOptions({ title: series.name })
    }
  }, [navigation, series])

  if (!series) {
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
            Failed to load series!
          </Text>
        </ScreenCentered>
      )
    }
  } else {
    const allAuthors = series.books.flatMap(book => book.authors)
    const uniqueAuthors = [
      ...new Map(allAuthors.map(author => [author.id, author])).values()
    ]

    return (
      <SafeBottomBorder>
        <BookGrid
          books={series.books}
          ListHeaderComponent={
            <View style={tw`ml-2 mt-2`}>
              <Header1>{series.name}</Header1>
              <WrappingListOfLinks
                prefix="by"
                items={uniqueAuthors}
                onPressLink={author =>
                  navigation.push('Person', { personId: author.personId })
                }
                style={tw`text-xl text-gray-500 dark:text-gray-400`}
                linkStyle={tw`text-xl text-lime-500 dark:text-lime-400`}
              />
            </View>
          }
        />
      </SafeBottomBorder>
    )
  }

  return null
}
