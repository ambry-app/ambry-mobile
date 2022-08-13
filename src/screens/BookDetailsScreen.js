import { useNavigation } from '@react-navigation/core'
import Moment from 'moment'
import React, { useEffect } from 'react'
import { Image, Text, View } from 'react-native'
import {
  ScrollView,
  TouchableNativeFeedback
} from 'react-native-gesture-handler'
import Description from '../components/Description'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import PlayButton from '../components/PlayButton'
import SafeBottomBorder from '../components/SafeBottomBorder'
import ScreenCentered from '../components/ScreenCentered'
import WrappingListOfLinks from '../components/WrappingListOfLinks'
import tw from '../lib/tailwind'
import { durationDisplay } from '../lib/utils'
import { uriSource, useBook } from '../stores/AmbryAPI'
import usePlayer, { loadMedia, setLoadingImage } from '../stores/Player'

function MediaList({ book, media: mediaList }) {
  const navigation = useNavigation()
  const selectedMedia = usePlayer(state => state.selectedMedia)
  const mediaLength = mediaList.length

  if (mediaLength === 0) {
    return (
      <Text style={tw`text-gray-200 my-4 font-bold`}>
        Sorry, there are no recordings uploaded yet for this book.
      </Text>
    )
  } else {
    return (
      <View style={tw`rounded-lg border-0 bg-gray-900 shadow-lg my-4`}>
        {mediaList.map((media, i) => (
          <View key={media.id}>
            <View style={tw`overflow-hidden rounded-lg bg-gray-900`}>
              <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(
                  tw.color('gray-400'),
                  true
                )}
                onPress={() => {
                  navigation.navigate('Player')

                  if (selectedMedia?.id !== media.id) {
                    setLoadingImage(book.imagePath)
                    setTimeout(() => {
                      loadMedia(media.id, book.imagePath)
                    }, 500)
                  }
                }}
              >
                <View
                  style={tw.style('flex-row justify-between items-center p-3')}
                >
                  <View style={tw`flex-shrink`}>
                    <WrappingListOfLinks
                      prefix="Narrated by"
                      suffix={media.fullCast ? 'and a full cast' : null}
                      items={media.narrators}
                      keyExtractor={narrator => narrator.person.id}
                      onPressLink={narrator =>
                        navigation.push('Person', {
                          personId: narrator.person.id
                        })
                      }
                      style={tw`leading-none text-lg text-gray-200`}
                      linkStyle={tw`leading-none text-lg text-gray-200`}
                    />
                    {media.abridged && (
                      <Text style={tw`text-lg text-gray-400`}>(Abridged)</Text>
                    )}
                    <Text style={tw`text-gray-400`}>
                      {durationDisplay(media.duration)}
                    </Text>
                  </View>
                  <PlayButton size={48} />
                </View>
              </TouchableNativeFeedback>
            </View>
            {i !== mediaLength - 1 && (
              <View style={tw`mx-3 border-t border-gray-700`} />
            )}
          </View>
        ))}
      </View>
    )
  }
}

export default function BookDetailsScreen({ route, navigation }) {
  const { isLoading, isError, data } = useBook(route.params.bookId)
  const book = data?.node

  useEffect(() => {
    if (book?.title) {
      navigation.setOptions({ title: book.title })
    }
  }, [navigation, book])

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
        <Text style={tw`text-gray-200`}>Failed to load book!</Text>
      </ScreenCentered>
    )
  }

  return (
    <SafeBottomBorder>
      <ScrollView>
        <View style={tw`p-4`}>
          <WrappingListOfLinks
            prefix="by"
            items={book.authors}
            onPressLink={author => {
              navigation.push('Person', {
                personId: author.person.id
              })
            }}
            style={tw`leading-none text-lg text-gray-200`}
            linkStyle={tw`leading-none text-lg text-gray-200`}
          />
          <WrappingListOfLinks
            items={book.seriesBooks}
            onPressLink={seriesBook =>
              navigation.push('Series', { seriesId: seriesBook.series.id })
            }
            nameExtractor={seriesBook =>
              `${seriesBook.series.name} #${seriesBook.bookNumber}`
            }
            style={tw`text-gray-400`}
            linkStyle={tw`text-gray-400`}
          />
          <MediaList book={book} media={book.media} />
          <View style={tw`mt-4 rounded-2xl bg-gray-800 shadow-lg`}>
            <Image
              source={uriSource(book.imagePath)}
              style={tw.style('rounded-2xl', 'w-full', {
                aspectRatio: 10 / 15.5
              })}
            />
          </View>
          <Text style={tw`text-gray-500 text-sm mt-1 mb-4`}>
            Published {Moment(book.published).format('MMMM Do, YYYY')}
          </Text>
          <Description description={book.description} />
        </View>
      </ScrollView>
    </SafeBottomBorder>
  )
}
