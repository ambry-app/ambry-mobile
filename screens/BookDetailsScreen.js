import React, { useEffect, useReducer, useCallback } from 'react'
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import Markdown from 'react-native-markdown-display'
import tw from '../lib/tailwind'
import Moment from 'moment'

import { formatImageUri, getBook } from '../api/ambry'
import WrappingListOfLinks from '../components/WrappingListOfLinks'
import { actionCreators, initialState, reducer } from '../reducers/book'

export default function BookDetailsScreen ({ route }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { book, loading, error } = state

  const fetchBook = useCallback(async () => {
    dispatch(actionCreators.loading())

    try {
      const book = await getBook(route.params.bookId)
      dispatch(actionCreators.success(book))
    } catch (e) {
      dispatch(actionCreators.failure())
    }
  }, [route.params.bookId])

  useEffect(() => {
    fetchBook()
  }, [])

  if (!book) {
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
          <Text>Failed to load book!</Text>
        </View>
      )
    }
  } else {
    const markdownStyles = StyleSheet.create({
      // Tailwind `text-gray-700` when gray = colors.gray in tailwind.config.js
      body: { color: '#3F3F46', fontSize: 18 }
    })

    return (
      <ScrollView>
        <View style={tw`p-4`}>
          <Text style={tw`text-4xl text-gray-700`}>{book.title}</Text>
          <WrappingListOfLinks
            prefix='by'
            items={book.authors}
            navigationArgsExtractor={author => [
              'Person',
              { personId: author.id }
            ]}
            style={tw`text-xl text-gray-500`}
            linkStyle={tw`text-xl text-lime-500`}
          />
          <WrappingListOfLinks
            items={book.series}
            navigationArgsExtractor={series => [
              'Series',
              { seriesId: series.id }
            ]}
            nameExtractor={series => `${series.name} #${series.book_number}`}
            style={tw`text-lg text-gray-400`}
            linkStyle={tw`text-lg text-gray-400`}
          />
          <View
            style={tw`m-8 mb-0 rounded-2xl border-gray-200 bg-gray-200 shadow-lg`}
          >
            <Image
              source={{ uri: formatImageUri(book.image_path) }}
              style={tw.style('rounded-2xl', 'w-full', {
                aspectRatio: 10 / 15
              })}
            />
          </View>
          <Text style={tw`text-gray-400 text-sm ml-8 mt-2 mb-4`}>
            Published {Moment(book.published).format('MMMM Do, YYYY')}
          </Text>
          {/* TODO: recordings go here */}
          <Markdown style={markdownStyles}>{book.description}</Markdown>
        </View>
      </ScrollView>
    )
  }

  return null
}
