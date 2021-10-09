import React from 'react'
import { FlatList } from 'react-native'

import BookLink from './BookLink'

export default function BookGrid ({ books, onEndReached }) {
  return (
    <FlatList
      data={books}
      keyExtractor={item => item.id}
      numColumns={2}
      onEndReached={onEndReached}
      renderItem={({ item }) => <BookLink book={item} />}
    />
  )
}
