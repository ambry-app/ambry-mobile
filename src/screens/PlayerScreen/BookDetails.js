import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useNavigation } from '@react-navigation/core'
import { StackActions } from '@react-navigation/native'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import WrappingListOfLinks from '../../components/WrappingListOfLinks'
import tw from '../../lib/tailwind'

export default function BookDetails({ imageSource, media }) {
  const navigation = useNavigation()

  return (
    <>
      <View style={tw`flex-row items-center`}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <FontAwesomeIcon icon="bars" color="white" size={24} />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          style={tw`ml-2 text-xl font-bold text-gray-700 dark:text-gray-200`}
        >
          {media.book.title}
        </Text>
      </View>
      <View style={tw`mt-2 flex-row`}>
        <View style={tw`flex-none`}>
          <View style={tw`w-28 rounded-md bg-gray-200 dark:bg-gray-800`}>
            <Image
              source={imageSource}
              style={tw.style('rounded-md', 'w-full', {
                aspectRatio: 10 / 15
              })}
            />
          </View>
        </View>
        <View style={tw`mt-2 pl-4 flex-grow`}>
          <WrappingListOfLinks
            prefix="by"
            items={media.book.authors}
            onPressLink={author => {
              navigation.dispatch(
                StackActions.push('Person', {
                  personId: author.personId
                })
              )
              navigation.navigate('Library')
            }}
            style={tw`leading-none text-lg text-gray-500 dark:text-gray-400`}
            linkStyle={tw`leading-none text-lg text-lime-500 dark:text-lime-400`}
          />
          <WrappingListOfLinks
            prefix="Narrated by"
            suffix={media.fullCast ? 'and a full cast' : null}
            items={media.narrators}
            keyExtractor={narrator => narrator.personId}
            onPressLink={narrator => {
              navigation.dispatch(
                StackActions.push('Person', {
                  personId: narrator.personId
                })
              )
              navigation.navigate('Library')
            }}
            style={tw`text-gray-500 dark:text-gray-400`}
            linkStyle={tw`text-lime-500 dark:text-lime-400`}
          />
          <WrappingListOfLinks
            items={media.book.series}
            onPressLink={series => {
              navigation.dispatch(
                StackActions.push('Series', {
                  seriesId: series.id
                })
              )
              navigation.navigate('Library')
            }}
            nameExtractor={series => `${series.name} #${series.bookNumber}`}
            style={tw`text-gray-400 dark:text-gray-500`}
            linkStyle={tw`text-gray-400 dark:text-gray-500`}
          />
        </View>
      </View>
    </>
  )
}
