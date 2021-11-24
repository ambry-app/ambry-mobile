import { useNavigation } from '@react-navigation/core'
import { StackActions } from '@react-navigation/native'
import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { Header2 } from '../../components/Headers'
import WrappingListOfLinks from '../../components/WrappingListOfLinks'
import tw from '../../lib/tailwind'

export default function BookDetails({ imageSource, media }) {
  const navigation = useNavigation()

  return (
    <View style={tw`flex-row`}>
      <View style={tw`w-1/4`}>
        <View style={tw`rounded-xl border-gray-200 bg-gray-200 shadow-md`}>
          <Image
            source={imageSource}
            style={tw.style('rounded-md', 'w-full', {
              aspectRatio: 10 / 15
            })}
          />
        </View>
      </View>
      <View style={tw`pl-4 w-3/4`}>
        <TouchableOpacity
          onPress={() => {
            navigation.dispatch(
              StackActions.push('Book', {
                bookId: media.book.id
              })
            )
            navigation.navigate('Library')
          }}
        >
          <Header2>{media.book.title}</Header2>
        </TouchableOpacity>
        <WrappingListOfLinks
          prefix="by"
          items={media.book.authors}
          onPressLink={author => {
            navigation.dispatch(
              StackActions.push('Person', {
                personId: author.personId
              })
            )
            navigation.navigate('Library')
          }}
          style={tw`leading-none text-lg text-gray-500 dark:text-gray-400`}
          linkStyle={tw`leading-none text-lg text-lime-500 dark:text-lime-400`}
        />
        <WrappingListOfLinks
          prefix="Narrated by"
          suffix={media.fullCast ? 'and a full cast' : null}
          items={media.narrators}
          keyExtractor={narrator => narrator.personId}
          onPressLink={narrator => {
            navigation.dispatch(
              StackActions.push('Person', {
                personId: narrator.personId
              })
            )
            navigation.navigate('Library')
          }}
          style={tw`text-gray-500 dark:text-gray-400`}
          linkStyle={tw`text-lime-500 dark:text-lime-400`}
        />
        <WrappingListOfLinks
          items={media.book.series}
          onPressLink={series => {
            navigation.dispatch(
              StackActions.push('Series', {
                seriesId: series.id
              })
            )
            navigation.navigate('Library')
          }}
          nameExtractor={series => `${series.name} #${series.bookNumber}`}
          style={tw`text-gray-400 dark:text-gray-500`}
          linkStyle={tw`text-gray-400 dark:text-gray-500`}
        />
      </View>
    </View>
  )
}
