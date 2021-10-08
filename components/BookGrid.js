import React from 'react'
import { FlatList } from 'react-native'

import BookLink from './BookLink'

export default function BookGrid ({ books, numColumns, onEndReached }) {
  return (
    <FlatList
      data={books}
      keyExtractor={item => item.id}
      numColumns={numColumns}
      onEndReached={onEndReached}
      renderItem={({ item }) => <BookLink book={item} />}
    />
  )
}
