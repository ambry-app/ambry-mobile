import React, { useEffect, useReducer, useCallback } from 'react'
import { Image, SectionList, Text, View } from 'react-native'
import tw from '../lib/tailwind'

import BookGrid from '../components/BookGrid'
import Description from '../components/Description'
import { Header1, Header2 } from '../components/Headers'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import ScreenCentered from '../components/ScreenCentered'

import { formatImageUri, getPerson } from '../api/ambry'
import { actionCreators, initialState, reducer } from '../reducers/person'

function PersonHeader ({ person }) {
  return (
    <View style={tw`p-4`}>
      <Header1 style={tw`text-center`}>{person.name}</Header1>
      <View
        style={tw`mx-12 my-8 rounded-full border-gray-200 bg-gray-200 shadow-lg`}
      >
        <Image
          source={{ uri: formatImageUri(person.imagePath) }}
          style={tw.style('rounded-full w-full', {
            aspectRatio: 1 / 1
          })}
        />
      </View>
      <Description description={person.description} />
    </View>
  )
}

export default function PersonDetailsScreen ({ route }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { person, loading, error } = state

  const fetchPerson = useCallback(async () => {
    dispatch(actionCreators.loading())

    try {
      const person = await getPerson(route.params.personId)
      dispatch(actionCreators.success(person))
    } catch (e) {
      dispatch(actionCreators.failure())
    }
  }, [route.params.personId])

  useEffect(() => {
    fetchPerson()
  }, [])

  if (!person) {
    if (loading) {
      return (
        <ScreenCentered>
          <LargeActivityIndicator />
        </ScreenCentered>
      )
    }

    if (error) {
      return (
        <ScreenCentered>
          <Text style={tw`text-gray-700`}>Failed to load person!</Text>
        </ScreenCentered>
      )
    }
  } else {
    const authorSections = person.authors.map(author => {
      return {
        title:
          author.name == person.name
            ? `Written by ${author.name}`
            : `Written by ${person.name} as ${author.name}`,
        data: [{ id: author.id, books: author.books }]
      }
    })

    const narratorSections = person.narrators.map(narrator => {
      return {
        title:
          narrator.name == person.name
            ? `Narrated by ${narrator.name}`
            : `Narrated by ${person.name} as ${narrator.name}`,
        data: [{ id: narrator.id, books: narrator.books }]
      }
    })
    return (
      <SectionList
        sections={[...authorSections, ...narratorSections]}
        keyExtractor={({ id }) => id}
        renderItem={({ item: { books } }) => <BookGrid books={books} />}
        renderSectionHeader={({ section: { title } }) => (
          <Header2 style={tw`px-4 pt-8 pb-0`}>{title}</Header2>
        )}
        ListHeaderComponent={<PersonHeader person={person} />}
      />
    )
  }

  return null
}
