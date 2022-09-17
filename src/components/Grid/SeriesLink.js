import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { Image, Text, View } from 'react-native'
import {
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native-gesture-handler'
import tw from '../../lib/tailwind'
import { useSource } from '../../stores/AmbryAPI'

export default function SeriesLink({ series }) {
  const navigation = useNavigation()

  const seriesBooks = series.seriesSeriesBooks.edges.map(edge => edge.node)
  const allAuthors = seriesBooks.flatMap(seriesBook => seriesBook.book.authors)
  const uniqueAuthors = [
    ...new Map(allAuthors.map(author => [author.id, author])).values()
  ]

  const authorsList = uniqueAuthors.map(author => (
    <TouchableOpacity
      key={author.id}
      onPress={() => navigation.push('Person', { personId: author.person.id })}
    >
      <Text style={tw`leading-none text-lg text-gray-400 text-center`}>
        {author.name}
      </Text>
    </TouchableOpacity>
  ))

  return (
    <View style={tw`p-2 w-1/2`}>
      <View style={tw`rounded-lg mb-1 overflow-hidden`}>
        <TouchableNativeFeedback
          onPress={() => navigation.push('Series', { seriesId: series.id })}
          useForeground={true}
          background={TouchableNativeFeedback.Ripple(
            tw.color('gray-200'),
            true
          )}
        >
          <View
            style={[
              tw`flex items-center justify-center`,
              { aspectRatio: 10 / 15.5 }
            ]}
          >
            <BookCovers seriesBooks={seriesBooks} />
          </View>
        </TouchableNativeFeedback>
      </View>
      <TouchableOpacity
        onPress={() => navigation.push('Series', { seriesId: series.id })}
      >
        <Text style={tw`text-xl text-gray-200 text-center`}>{series.name}</Text>
      </TouchableOpacity>
      {authorsList}
    </View>
  )
}

function BookCovers({ seriesBooks }) {
  const [firstBook, secondBook, thirdBook] = seriesBooks
    .slice(0, 3)
    .map(seriesBook => seriesBook.book)

  if (firstBook && secondBook && thirdBook) {
    return ThreeBooks({ firstBook, secondBook, thirdBook })
  } else if (firstBook && secondBook) {
    return TwoBooks({ firstBook, secondBook })
  } else if (firstBook) {
    return OneBook({ firstBook })
  }
}

function ThreeBooks({ firstBook, secondBook, thirdBook }) {
  const source = useSource()

  return (
    <>
      <Image
        source={source(thirdBook.imagePath)}
        style={[
          tw`rounded-lg w-10/12 absolute bottom-1 right-1 border border-gray-800`,
          { aspectRatio: 10 / 15.5, transform: [{ rotate: '2deg' }] }
        ]}
      />
      <Image
        source={source(secondBook.imagePath)}
        style={[
          tw`rounded-lg w-10/12 border border-gray-800`,
          { aspectRatio: 10 / 15.5 }
        ]}
      />
      <Image
        source={source(firstBook.imagePath)}
        style={[
          tw`rounded-lg w-10/12 absolute top-1 left-1 border border-gray-800`,
          { aspectRatio: 10 / 15.5, transform: [{ rotate: '-2deg' }] }
        ]}
      />
    </>
  )
}

function TwoBooks({ firstBook, secondBook }) {
  const source = useSource()

  return (
    <>
      <Image
        source={source(secondBook.imagePath)}
        style={[
          tw`rounded-lg w-10/12 absolute bottom-2 right-2 border border-gray-800`,
          { aspectRatio: 10 / 15.5, transform: [{ rotate: '1deg' }] }
        ]}
      />
      <Image
        source={source(firstBook.imagePath)}
        style={[
          tw`rounded-lg w-10/12 absolute top-2 left-2 border border-gray-800`,
          { aspectRatio: 10 / 15.5, transform: [{ rotate: '-1deg' }] }
        ]}
      />
    </>
  )
}

function OneBook({ firstBook }) {
  const source = useSource()

  return (
    <Image
      source={source(firstBook.imagePath)}
      style={[
        tw`rounded-lg w-10/12 border border-gray-800`,
        { aspectRatio: 10 / 15.5 }
      ]}
    />
  )
}
