import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native'

import { useAuth } from '../contexts/Auth'

import tw from '../lib/tailwind'

import { imageSource } from '../api/ambry'

export default function BookLink ({ book }) {
  const { authData } = useAuth()
  const navigation = useNavigation()

  const authors = book.authors.map(author => (
    <TouchableOpacity
      key={author.id}
      onPress={() => navigation.push('Person', { personId: author.personId })}
    >
      <Text style={tw`text-lg text-gray-500 text-center`}>{author.name}</Text>
    </TouchableOpacity>
  ))

  const series = book.series.map(series => (
    <TouchableOpacity
      key={series.id}
      onPress={() => navigation.push('Series', { seriesId: series.id })}
    >
      <Text style={tw`text-gray-400 text-center`}>
        {series.name} #{series.bookNumber}
      </Text>
    </TouchableOpacity>
  ))

  return (
    <View style={tw`p-2 w-1/2`}>
      {book.bookNumber && (
        <Text style={tw`text-center text-lg text-gray-700`}>
          Book {book.bookNumber}
        </Text>
      )}
      <Pressable
        style={({ pressed }) => [
          tw.style(['rounded-lg', 'border-gray-200', 'bg-gray-200']),
          pressed
            ? tw.style(['shadow-md', 'mt-1', 'mb-0'])
            : tw.style(['shadow-lg', 'mb-1'])
        ]}
        onPress={() => navigation.push('Book', { bookId: book.id })}
      >
        <Image
          source={imageSource(authData, book.imagePath)}
          style={tw.style('rounded-lg', 'w-full', {
            aspectRatio: 10 / 15
          })}
        />
      </Pressable>
      <TouchableOpacity
        onPress={() => navigation.push('Book', { bookId: book.id })}
      >
        <Text style={tw`text-xl text-gray-700 text-center`}>{book.title}</Text>
      </TouchableOpacity>
      {authors}
      {series}
    </View>
  )
}
