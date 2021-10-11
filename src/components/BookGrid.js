import React from 'react'
import { FlatList } from 'react-native'

import tw from '../lib/tailwind'

import BookLink from './BookLink'

export default function BookGrid ({
  books,
  onEndReached,
  ListHeaderComponent,
  ListFooterComponent
}) {
  return (
    <FlatList
      style={tw`p-2`}
      data={books}
      keyExtractor={item => item.id}
      numColumns={2}
      onEndReached={onEndReached}
      renderItem={({ item }) => <BookLink book={item} />}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
    />
  )
}
