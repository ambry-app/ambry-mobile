import { useNavigation } from '@react-navigation/core'
import Moment from 'moment'
import React, { useCallback, useEffect, useReducer } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { getBook, uriSource } from '../api/ambry'
import Description from '../components/Description'
import { Header1 } from '../components/Headers'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import PlayButton from '../components/PlayButton'
import ScreenCentered from '../components/ScreenCentered'
import WrappingListOfLinks from '../components/WrappingListOfLinks'
import { useAuth } from '../contexts/Auth'
import { usePlayer } from '../contexts/Player'
import tw from '../lib/tailwind'
import { durationDisplay } from '../lib/utils'
import { actionCreators, initialState, reducer } from '../reducers/book'

function MediaList ({ book, media }) {
  const navigation = useNavigation()
  const { loadMedia } = usePlayer()

  if (media.length == 0) {
    return (
      <Text style={tw`text-gray-700 dark:text-gray-200 my-4 font-bold`}>
        Sorry, there are no recordings uploaded for this book.
      </Text>
    )
  } else {
    return (
      <View
        style={tw`rounded-lg border border-gray-200 bg-gray-100 dark:border-0 dark:bg-gray-800 shadow-lg px-3 mb-4`}
      >
        {media.map((media, i) => (
          <View
            key={media.id}
            style={tw.style(
              'flex-row justify-between items-center py-3 border-gray-200 dark:border-gray-700',
              {
                'border-t': i > 0
              }
            )}
          >
            <View style={tw`flex-shrink`}>
              <Text style={tw`text-lg text-gray-700 dark:text-gray-200`}>
                {book.title} ({media.abridged ? 'Abridged' : 'Unabridged'})
              </Text>
              <WrappingListOfLinks
                prefix='Narrated by'
                suffix={media.fullCast ? 'and a full cast' : null}
                items={media.narrators}
                keyExtractor={narrator => narrator.personId}
                onPressLink={narrator =>
                  navigation.navigate('Library', {
                    screen: 'Person',
                    params: { personId: narrator.personId }
                  })
                }
                style={tw`text-lg text-gray-500 dark:text-gray-400`}
                linkStyle={tw`text-lg text-lime-500 dark:text-lime-400`}
              />
              <Text style={tw`text-sm text-gray-400 dark:text-gray-500`}>
                {durationDisplay(media.duration)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('PlayerDrawer', {
                  screen: 'PlayerScreen'
                })
                loadMedia(media.id)
              }}
            >
              <PlayButton width={50} height={50} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )
  }
}

export default function BookDetailsScreen ({ route, navigation }) {
  const { signOut, authData } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  const { book, loading, error } = state

  const fetchBook = useCallback(async () => {
    dispatch(actionCreators.loading())

    try {
      const book = await getBook(authData, route.params.bookId)
      dispatch(actionCreators.success(book))
    } catch (status) {
      if (status == 401) {
        await signOut()
      } else {
        dispatch(actionCreators.failure())
      }
    }
  }, [route.params.bookId])

  useEffect(() => {
    fetchBook()
  }, [route.params.bookId])

  useEffect(() => {
    if (book) {
      navigation.setOptions({ title: book.title })
    }
  }, [book])

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
          <Text style={tw`text-gray-700 dark:text-gray-200`}>
            Failed to load book!
          </Text>
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
            onPressLink={author =>
              navigation.push('Person', { personId: author.personId })
            }
            style={tw`text-xl text-gray-500 dark:text-gray-400`}
            linkStyle={tw`text-xl text-lime-500 dark:text-lime-400`}
          />
          <WrappingListOfLinks
            items={book.series}
            onPressLink={series =>
              navigation.push('Series', { seriesId: series.id })
            }
            nameExtractor={series => `${series.name} #${series.bookNumber}`}
            style={tw`text-lg text-gray-400 dark:text-gray-500`}
            linkStyle={tw`text-lg text-gray-400 dark:text-gray-500`}
          />
          <View
            style={tw`mt-8 rounded-2xl border-gray-200 bg-gray-200 shadow-lg`}
          >
            <Image
              source={uriSource(authData, book.imagePath)}
              style={tw.style('rounded-2xl', 'w-full', {
                aspectRatio: 10 / 15
              })}
            />
          </View>
          <Text style={tw`text-gray-400 dark:text-gray-500 text-sm mt-1 mb-4`}>
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
