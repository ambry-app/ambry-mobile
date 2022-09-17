import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { Image, Text, View } from 'react-native'
import {
  TouchableNativeFeedback,
  TouchableOpacity
} from 'react-native-gesture-handler'
import tw from '../../lib/tailwind'
import { useSource } from '../../stores/AmbryAPI'

export default function PersonLink({ person }) {
  const navigation = useNavigation()
  const source = useSource()

  const authors = person.authors.filter(author => author.name !== person.name)

  const narrators = person.narrators.filter(
    narrator => narrator.name !== person.name
  )

  const authorsList = authors.map(author => (
    <TouchableOpacity
      key={author.id}
      onPress={() => navigation.push('Person', { personId: person.id })}
    >
      <Text style={tw`leading-none text-lg text-gray-400 text-center`}>
        {author.name}
      </Text>
    </TouchableOpacity>
  ))

  const narratorsList = narrators.map(narrator => (
    <TouchableOpacity
      key={narrator.id}
      onPress={() => navigation.push('Person', { personId: person.id })}
    >
      <Text style={tw`leading-none text-lg text-gray-400 text-center`}>
        {narrator.name}
      </Text>
    </TouchableOpacity>
  ))

  return (
    <View style={tw`p-2 w-1/2 flex justify-center`}>
      <View style={tw`rounded-full bg-gray-800 mb-1 overflow-hidden`}>
        <TouchableNativeFeedback
          onPress={() => navigation.push('Person', { personId: person.id })}
          useForeground={true}
          background={TouchableNativeFeedback.Ripple(
            tw.color('gray-200'),
            true
          )}
        >
          <View>
            <Image
              source={source(person.imagePath)}
              style={[
                tw`rounded-full w-full border border-gray-800`,
                { aspectRatio: 1 / 1 }
              ]}
            />
          </View>
        </TouchableNativeFeedback>
      </View>
      <TouchableOpacity
        onPress={() => navigation.push('Person', { personId: person.id })}
      >
        <Text style={tw`text-xl text-gray-200 text-center`}>{person.name}</Text>
      </TouchableOpacity>
      {authorsList}
      {narratorsList}
    </View>
  )
}
