import React, { useEffect, useReducer, useCallback } from 'react'
import { Button, Image, ScrollView, Text, View } from 'react-native'
import Moment from 'moment'

import tw from '../lib/tailwind'

import Description from '../components/Description'
import { Header1 } from '../components/Headers'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'
import WrappingListOfLinks from '../components/WrappingListOfLinks'

import { formatImageUri, getBook } from '../api/ambry'
import { actionCreators, initialState, reducer } from '../reducers/book'

import Play from '../assets/play.svg'

function MediaList ({ book, media }) {
  if (media.length == 0) {
    return (
      <Text style={tw`my-4 font-bold`}>
        Sorry, there are no recordings uploaded for this book.
      </Text>
    )
  } else {
    return (
      <View
        style={tw`rounded-lg border border-gray-200 bg-white shadow-lg px-3 mb-4`}
      >
        {media.map((media, i) => (
          <View
            key={media.id}
            style={tw.style(
              'flex-row justify-between items-center py-3 border-gray-200',
              {
                'border-t': i > 0
              }
            )}
          >
            <View style={tw`flex-shrink`}>
              <Text style={tw`text-lg text-gray-700`}>{book.title}</Text>
              <WrappingListOfLinks
                prefix='Narrated by'
                items={media.narrators}
                navigationArgsExtractor={narrator => [
                  'Person',
                  { personId: narrator.personId }
                ]}
                style={tw`text-lg text-gray-500`}
                linkStyle={tw`text-lg text-lime-500`}
              />
            </View>
            <Play width={50} height={50} />
          </View>
        ))}
      </View>
    )
  }
}

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
        <ScreenCentered>
          <LargeActivityIndicator />
        </ScreenCentered>
      )
    }

    if (error) {
      return (
        <ScreenCentered>
          <Text>Failed to load book!</Text>
        </ScreenCentered>
      )
    }
  } else {
    return (
      <ScrollView>
        <View style={tw`p-4`}>
          <Header1>{book.title}</Header1>
          <WrappingListOfLinks
            prefix='by'
            items={book.authors}
            navigationArgsExtractor={author => [
              'Person',
              { personId: author.personId }
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
            nameExtractor={series => `${series.name} #${series.bookNumber}`}
            style={tw`text-lg text-gray-400`}
            linkStyle={tw`text-lg text-gray-400`}
          />
          <View
            style={tw`mt-8 rounded-2xl border-gray-200 bg-gray-200 shadow-lg`}
          >
            <Image
              source={{ uri: formatImageUri(book.imagePath) }}
              style={tw.style('rounded-2xl', 'w-full', {
                aspectRatio: 10 / 15
              })}
            />
          </View>
          <Text style={tw`text-gray-400 text-sm mt-1 mb-4`}>
            Published {Moment(book.published).format('MMMM Do, YYYY')}
          </Text>
          <MediaList book={book} media={book.media} />
          <Description description={book.description} />
        </View>
      </ScrollView>
    )
  }

  return null
}
