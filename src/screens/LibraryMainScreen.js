import { useDebounce } from '@react-hook/debounce'
import React, { useEffect } from 'react'
import { Button, Text, View } from 'react-native'
import Grid from '../components/Grid'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import SafeBottomBorder from '../components/SafeBottomBorder'
import ScreenCentered from '../components/ScreenCentered'
import { useRefreshOnFocus } from '../hooks/refetchOnFocus'
import tw from '../lib/tailwind'
import { useBooks, useSearch } from '../stores/AmbryAPI'

export default function LibraryMainScreen({ navigation }) {
  const [search, setSearch] = useDebounce('', 500)

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: event => {
          console.log(event)
          setSearch(event.nativeEvent.text)
        },
        placeholder: 'search library',
        hintTextColor: tw.color('gray-500'),
        headerIconColor: tw.color('white')
      }
    })
  }, [navigation, setSearch])

  if (search && search.length >= 3) {
    return <SearchResults searchQuery={search} />
  } else {
    return <RecentBooks />
  }
}

function RecentBooks() {
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
    <SafeBottomBorder>
      <Grid
        books={books}
        onEndReached={loadMore}
        ListFooterComponent={
          <View style={tw`h-14`}>
            {isFetchingNextPage && <LargeActivityIndicator />}
          </View>
        }
      />
    </SafeBottomBorder>
  )
}

function SearchResults({ searchQuery }) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = useSearch(searchQuery)

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
        <Text style={tw`text-gray-200 mb-4`}>
          Failed to load search results!
        </Text>
        <Button title="Retry" color={tw.color('lime-500')} onPress={refetch} />
      </ScreenCentered>
    )
  }

  const results = data.pages.flatMap(page =>
    page.search.edges.map(edge => edge.node)
  )

  if (results.length === 0) {
    return (
      <View style={tw.style('items-center pt-12', { flex: 1 })}>
        <Text style={tw`text-gray-200 mb-4`}>
          Sorry, there are no results for '{searchQuery}'.
        </Text>
      </View>
    )
  } else {
    return (
      <SafeBottomBorder>
        <Grid
          books={results}
          onEndReached={loadMore}
          ListFooterComponent={
            <View style={tw`h-14`}>
              {isFetchingNextPage && <LargeActivityIndicator />}
            </View>
          }
        />
      </SafeBottomBorder>
    )
  }
}
