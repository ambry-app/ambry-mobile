import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { Image, Text, View } from 'react-native'
import {
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native-gesture-handler'
import tw from '../../lib/tailwind'
import { useSource } from '../../stores/AmbryAPI'

export default function BookLink({ book, seriesBook: primarySeriesBook }) {
  const navigation = useNavigation()
  const source = useSource()

  const authorsList = book.authors.map(author => (
    <TouchableOpacity
      key={author.id}
      onPress={() => navigation.push('Person', { personId: author.person.id })}
    >
      <Text style={tw`leading-none text-lg text-gray-400 text-center`}>
        {author.name}
      </Text>
    </TouchableOpacity>
  ))

  const seriesList = book.seriesBooks.map(seriesBook => (
    <TouchableOpacity
      key={seriesBook.series.id}
      onPress={() =>
        navigation.push('Series', { seriesId: seriesBook.series.id })
      }
    >
      <Text style={tw`text-gray-500 text-center`}>
        {seriesBook.series.name} #{seriesBook.bookNumber}
      </Text>
    </TouchableOpacity>
  ))

  return (
    <View style={tw`p-2 w-1/2`}>
      {primarySeriesBook && (
        <Text style={tw`text-center text-lg text-gray-200`}>
          Book {primarySeriesBook.bookNumber}
        </Text>
      )}
      <View style={tw`rounded-lg bg-gray-800 mb-1 overflow-hidden`}>
        <TouchableNativeFeedback
          onPress={() => navigation.push('Book', { bookId: book.id })}
          useForeground={true}
          background={TouchableNativeFeedback.Ripple(
            tw.color('gray-200'),
            true
          )}
        >
          <View>
            <Image
              source={source(book.imagePath)}
              style={[
                tw`rounded-lg w-full border border-gray-800`,
                { aspectRatio: 10 / 15.5 }
              ]}
            />
          </View>
        </TouchableNativeFeedback>
      </View>
      <TouchableOpacity
        onPress={() => navigation.push('Book', { bookId: book.id })}
      >
        <Text style={tw`text-xl text-gray-200 text-center`}>{book.title}</Text>
      </TouchableOpacity>
      {authorsList}
      {seriesList}
    </View>
  )
}
