import { useNavigation } from '@react-navigation/core'
import React from 'react'
import {
  Image,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View
} from 'react-native'
import tw from '../lib/tailwind'
import { uriSource } from '../stores/AmbryAPI'

export default function BookLink({ book }) {
  const navigation = useNavigation()

  const authorsList = book.authors.map(author => (
    <TouchableOpacity
      key={author.id}
      onPress={() => navigation.push('Person', { personId: author.personId })}
    >
      <Text
        style={tw`leading-none text-lg text-gray-500 dark:text-gray-400 text-center`}
      >
        {author.name}
      </Text>
    </TouchableOpacity>
  ))

  const seriesList = book.series.map(series => (
    <TouchableOpacity
      key={series.id}
      onPress={() => navigation.push('Series', { seriesId: series.id })}
    >
      <Text style={tw`text-gray-400 dark:text-gray-500 text-center`}>
        {series.name} #{series.bookNumber}
      </Text>
    </TouchableOpacity>
  ))

  return (
    <View style={tw`p-2 w-1/2`}>
      {book.bookNumber && (
        <Text style={tw`text-center text-lg text-gray-700 dark:text-gray-200`}>
          Book {book.bookNumber}
        </Text>
      )}
      <View
        style={tw`rounded-lg bg-gray-100 dark:bg-gray-800 shadow-lg mb-1 overflow-hidden`}
      >
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
              source={uriSource(book.imagePath)}
              style={tw.style('rounded-lg', 'w-full', {
                aspectRatio: 10 / 15.5
              })}
            />
          </View>
        </TouchableNativeFeedback>
      </View>
      <TouchableOpacity
        onPress={() => navigation.push('Book', { bookId: book.id })}
      >
        <Text style={tw`text-xl text-gray-700 dark:text-gray-200 text-center`}>
          {book.title}
        </Text>
      </TouchableOpacity>
      {authorsList}
      {seriesList}
    </View>
  )
}
