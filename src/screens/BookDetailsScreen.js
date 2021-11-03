import { useNavigation } from '@react-navigation/core'
import Moment from 'moment'
import React, { useCallback, useEffect, useReducer } from 'react'
import {
  Image,
  ScrollView,
  Text,
  TouchableNativeFeedback,
  View
} from 'react-native'
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
  const mediaLength = media.length

  if (mediaLength == 0) {
    return (
      <Text style={tw`text-gray-700 dark:text-gray-200 my-4 font-bold`}>
        Sorry, there are no recordings uploaded yet for this book.
      </Text>
    )
  } else {
    return (
      <View
        style={tw`rounded-lg bg-gray-100 dark:border-0 dark:bg-gray-800 shadow-lg my-4`}
      >
        {media.map((media, i) => (
          <>
            <View
              style={tw`overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800`}
            >
              <TouchableNativeFeedback
                key={media.id}
                background={TouchableNativeFeedback.Ripple(
                  tw.color('gray-400'),
                  true
                )}
                onPress={() => {
                  navigation.navigate('PlayerDrawer', {
                    screen: 'PlayerScreen'
                  })
                  loadMedia(media.id)
                }}
              >
                <View
                  style={tw.style('flex-row justify-between items-center p-3')}
                >
                  <View style={tw`flex-shrink`}>
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
                      style={tw`text-lg text-gray-700 dark:text-gray-200`}
                      linkStyle={tw`text-lg text-lime-500 dark:text-lime-400`}
                    />
                    {media.abridged && (
                      <Text
                        style={tw`text-lg text-gray-500 dark:text-gray-400`}
                      >
                        (Abridged)
                      </Text>
                    )}
                    <Text style={tw`text-gray-500 dark:text-gray-400`}>
                      {durationDisplay(media.duration)}
                    </Text>
                  </View>
                  <PlayButton width={50} height={50} />
                </View>
              </TouchableNativeFeedback>
            </View>
            {i != mediaLength - 1 && (
              <View
                key={`separator-${i}`}
                style={tw`mx-3 border-t border-gray-200 dark:border-gray-700`}
              />
            )}
          </>
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
          <MediaList book={book} media={book.media} />
          <View
            style={tw`mt-4 rounded-2xl border-gray-200 bg-gray-200 shadow-lg`}
          >
            <Image
              source={uriSource(authData, book.imagePath)}
              style={tw.style('rounded-2xl', 'w-full', {
                aspectRatio: 10 / 15.5
              })}
            />
          </View>
          <Text style={tw`text-gray-400 dark:text-gray-500 text-sm mt-1 mb-4`}>
            Published {Moment(book.published).format('MMMM Do, YYYY')}
          </Text>
          <Description description={book.description} />
        </View>
      </ScrollView>
    )
  }

  return null
}
