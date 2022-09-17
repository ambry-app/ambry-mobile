import React, { useEffect } from 'react'
import { Image, SectionList, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Grid from '../components/Grid'
import Description from '../components/Description'
import LargeActivityIndicator from '../components/LargeActivityIndicator'
import SafeBottomBorder from '../components/SafeBottomBorder'
import ScreenCentered from '../components/ScreenCentered'
import { useRefreshOnFocus } from '../hooks/refetchOnFocus'
import tw from '../lib/tailwind'
import { usePerson, useSource } from '../stores/AmbryAPI'

function PersonHeader({ person }) {
  const source = useSource()

  return (
    <View style={tw`p-4`}>
      <View style={tw`mx-12 my-8 rounded-full bg-gray-900`}>
        <Image
          source={source(person.imagePath)}
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
  const { data, isLoading, isError, refetch } = usePerson(route.params.personId)
  const person = data?.node

  useRefreshOnFocus(refetch)

  useEffect(() => {
    if (person) {
      navigation.setOptions({ title: person.name })
    }
  }, [navigation, person])

  if (isLoading) {
    return (
      <ScreenCentered>
        <LargeActivityIndicator />
      </ScreenCentered>
    )
  }

  if (isError) {
    return (
      <ScreenCentered>
        <Text style={tw`text-gray-200`}>Failed to load person!</Text>
      </ScreenCentered>
    )
  }

  const authorSections = person.authors.map(author => {
    return {
      title:
        author.name === person.name
          ? `Written by ${author.name}`
          : `Written by ${person.name} as ${author.name}`,
      data: [
        {
          id: author.id,
          books: author.authoredBooks.edges.map(edge => edge.node)
          // FIXME: pass in author.authoredBooks.pageInfo.hasNextPage and a link
          // to bring us to a new screen for infinite scrolling of authored books.
        }
      ]
    }
  })

  const narratorSections = person.narrators.map(narrator => {
    return {
      title:
        narrator.name === person.name
          ? `Narrated by ${narrator.name}`
          : `Narrated by ${person.name} as ${narrator.name}`,
      data: [
        {
          id: narrator.id,
          books: narrator.narratedMedia.edges.map(edge => edge.node.book)
          // FIXME: pass in narrator.narratedMedia.pageInfo.hasNextPage and a
          // link to bring us to a new screen for infinite scrolling of narrated
          // media.
        }
      ]
    }
  })
  return (
    <SafeBottomBorder>
      <SectionList
        renderScrollComponent={scrollProps => <ScrollView {...scrollProps} />}
        sections={[...authorSections, ...narratorSections]}
        keyExtractor={({ id }) => id}
        renderItem={({ item: { books } }) => <Grid books={books} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={tw`px-4 pt-8 pb-0 text-xl font-bold text-gray-100`}>
            {title}
          </Text>
        )}
        ListHeaderComponent={<PersonHeader person={person} />}
      />
    </SafeBottomBorder>
  )
}
