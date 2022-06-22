import React, { useCallback, useEffect, useReducer } from 'react'
import { Image, SectionList, Text, View } from 'react-native'
import BookGrid from '../components/BookGrid'
import Description from '../components/Description'
import { Header1, Header2 } from '../components/Headers'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import SafeBottomBorder from '../components/SafeBottomBorder'
import ScreenCentered from '../components/ScreenCentered'
import tw from '../lib/tailwind'
import { actionCreators, initialState, reducer } from '../reducers/person'
import { getPerson, uriSource } from '../stores/AmbryAPI'

function PersonHeader({ person }) {
  return (
    <View style={tw`p-4`}>
      <Header1 style={tw`text-center`}>{person.name}</Header1>
      <View
        style={tw`mx-12 my-8 rounded-full bg-gray-200 dark:bg-gray-800 shadow-lg`}
      >
        <Image
          source={uriSource(person.imagePath)}
          style={tw.style('rounded-full w-full', {
            aspectRatio: 1 / 1
          })}
        />
      </View>
      <Description description={person.description} />
    </View>
  )
}

export default function PersonDetailsScreen({ route, navigation }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { person, loading, error } = state

  const fetchPerson = useCallback(async () => {
    dispatch(actionCreators.loading())

    try {
      const loadedPerson = await getPerson(route.params.personId)
      dispatch(actionCreators.success(loadedPerson))
    } catch {
      dispatch(actionCreators.failure())
    }
  }, [route.params.personId])

  useEffect(() => {
    fetchPerson()
  }, [fetchPerson, route.params.personId])

  useEffect(() => {
    if (person) {
      navigation.setOptions({ title: person.name })
    }
  }, [navigation, person])

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
          <Text style={tw`text-gray-700 dark:text-gray-200`}>
            Failed to load person!
          </Text>
        </ScreenCentered>
      )
    }
  } else {
    const authorSections = person.authors.map(author => {
      return {
        title:
          author.name === person.name
            ? `Written by ${author.name}`
            : `Written by ${person.name} as ${author.name}`,
        data: [{ id: author.id, books: author.books }]
      }
    })

    const narratorSections = person.narrators.map(narrator => {
      return {
        title:
          narrator.name === person.name
            ? `Narrated by ${narrator.name}`
            : `Narrated by ${person.name} as ${narrator.name}`,
        data: [{ id: narrator.id, books: narrator.books }]
      }
    })
    return (
      <SafeBottomBorder>
        <SectionList
          sections={[...authorSections, ...narratorSections]}
          keyExtractor={({ id }) => id}
          renderItem={({ item: { books } }) => <BookGrid books={books} />}
          renderSectionHeader={({ section: { title } }) => (
            <Header2 style={tw`px-4 pt-8 pb-0`}>{title}</Header2>
          )}
          ListHeaderComponent={<PersonHeader person={person} />}
        />
      </SafeBottomBorder>
    )
  }

  return null
}
