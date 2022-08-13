import React from 'react'
import { FlatList } from 'react-native-gesture-handler'
import tw from '../lib/tailwind'
import BookLink from './BookLink'

export default function BookGrid({
  books,
  onEndReached,
  onRefresh,
  refreshing,
  ListHeaderComponent,
  ListFooterComponent,
  itemType = 'book'
}) {
  return (
    <FlatList
      style={tw`p-2`}
      data={books}
      keyExtractor={item => item.id}
      numColumns={2}
      onEndReached={onEndReached}
      onEndReachedThreshold={1}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({ item }) =>
        itemType === 'seriesBook' ? (
          <BookLink book={item.book} seriesBook={item} />
        ) : (
          <BookLink book={item} />
        )
      }
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
    />
  )
}
