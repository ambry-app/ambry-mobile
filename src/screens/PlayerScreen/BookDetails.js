import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useNavigation } from '@react-navigation/core'
import { StackActions } from '@react-navigation/native'
import React from 'react'
import { Image, Text, View } from 'react-native'
import {
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native-gesture-handler'
import WrappingListOfLinks from '../../components/WrappingListOfLinks'
import tw from '../../lib/tailwind'

export default function BookDetails({ imageSource, media }) {
  const navigation = useNavigation()

  return (
    <>
      <View style={tw`flex-row items-center`}>
        <TouchableNativeFeedback
          onPress={() => navigation.getParent('LeftDrawer').openDrawer()}
          background={TouchableNativeFeedback.Ripple(
            tw.color('gray-400'),
            true
          )}
        >
          <FontAwesomeIcon icon="bars" color={tw.color('gray-100')} size={24} />
        </TouchableNativeFeedback>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Library', { screen: 'Main' })

            setImmediate(() => {
              navigation.dispatch(
                StackActions.push('Book', { bookId: media.book.id })
              )
            })
          }}
        >
          <Text
            numberOfLines={1}
            style={tw`ml-6 text-xl font-bold text-gray-100`}
          >
            {media.book.title}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={tw`mt-3 flex-row`}>
        <View style={tw`w-1/3`}>
          <View style={tw`w-full rounded-md bg-gray-800`}>
            <TouchableNativeFeedback
              onPress={() => {
                navigation.navigate('Library', { screen: 'Main' })

                setImmediate(() => {
                  navigation.dispatch(
                    StackActions.push('Book', { bookId: media.book.id })
                  )
                })
              }}
              background={TouchableNativeFeedback.Ripple(
                tw.color('gray-400'),
                true
              )}
            >
              <Image
                source={imageSource}
                style={tw.style('rounded-md', 'w-full', {
                  aspectRatio: 10 / 15.5
                })}
              />
            </TouchableNativeFeedback>
          </View>
        </View>
        <View style={tw`w-2/3 pl-3`}>
          <WrappingListOfLinks
            prefix="by"
            items={media.book.authors}
            onPressLink={author => {
              navigation.navigate('Library', { screen: 'Main' })

              setImmediate(() => {
                navigation.dispatch(
                  StackActions.push('Person', { personId: author.person.id })
                )
              })
            }}
            style={tw`leading-none text-lg text-gray-200`}
            linkStyle={tw`leading-none text-lg text-gray-200`}
          />
          <WrappingListOfLinks
            prefix="Narrated by"
            suffix={media.fullCast ? 'and a full cast' : null}
            items={media.narrators}
            keyExtractor={narrator => narrator.person.id}
            onPressLink={narrator => {
              navigation.navigate('Library', { screen: 'Main' })

              setImmediate(() => {
                navigation.dispatch(
                  StackActions.push('Person', { personId: narrator.person.id })
                )
              })
            }}
            style={tw`text-gray-200`}
            linkStyle={tw`text-gray-200`}
          />
          <WrappingListOfLinks
            items={media.book.seriesBooks}
            onPressLink={seriesBook => {
              navigation.navigate('Library', { screen: 'Main' })

              setImmediate(() => {
                navigation.dispatch(
                  StackActions.push('Series', {
                    seriesId: seriesBook.series.id
                  })
                )
              })
            }}
            nameExtractor={seriesBook =>
              `${seriesBook.series.name} #${seriesBook.bookNumber}`
            }
            style={tw`text-gray-400`}
            linkStyle={tw`text-gray-400`}
          />
        </View>
      </View>
    </>
  )
}
