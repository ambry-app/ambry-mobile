import React from 'react'
import { FlatList } from 'react-native-gesture-handler'
import tw from '../lib/tailwind'
import BookLink from './Grid/BookLink'
import PersonLink from './Grid/PersonLink'
import SeriesLink from './Grid/SeriesLink'

export default function Grid({
  books,
  onEndReached,
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
      renderItem={({ item }) => {
        switch (item.__typename) {
          case 'Book':
            return <BookLink book={item} />
          case 'SeriesBook':
            return <BookLink book={item.book} seriesBook={item} />
          case 'Person':
            return <PersonLink person={item} />
          case 'Series':
            return <SeriesLink series={item} />
        }
      }}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
    />
  )
}
