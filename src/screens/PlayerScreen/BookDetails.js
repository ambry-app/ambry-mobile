import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { TouchableNativeFeedback } from 'react-native-gesture-handler'
import WrappingListOfLinks from '../../components/WrappingListOfLinks'
import tw from '../../lib/tailwind'

export default function BookDetails({ imageSource, media }) {
  const navigation = useNavigation()

  return (
    <>
      <View style={tw`flex-row items-center`}>
        <TouchableNativeFeedback
          onPress={() => navigation.openDrawer()}
          background={TouchableNativeFeedback.Ripple(
            tw.color('gray-400'),
            true
          )}
        >
          <FontAwesomeIcon icon="bars" color={tw.color('gray-100')} size={24} />
        </TouchableNativeFeedback>
        <Text
          numberOfLines={1}
          style={tw`ml-6 text-xl font-bold text-gray-700 dark:text-gray-100`}
        >
          {media.book.title}
        </Text>
      </View>
      <View style={tw`mt-3 flex-row`}>
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
              navigation.push('Person', {
                personId: author.personId
              })
            }}
            style={tw`leading-none text-lg text-gray-500 dark:text-gray-200`}
            linkStyle={tw`leading-none text-lg text-lime-500 dark:text-gray-200`}
          />
          <WrappingListOfLinks
            prefix="Narrated by"
            suffix={media.fullCast ? 'and a full cast' : null}
            items={media.narrators}
            keyExtractor={narrator => narrator.personId}
            onPressLink={narrator => {
              navigation.push('Person', {
                personId: narrator.personId
              })
            }}
            style={tw`text-gray-500 dark:text-gray-200`}
            linkStyle={tw`text-lime-500 dark:text-gray-200`}
          />
          <WrappingListOfLinks
            items={media.book.series}
            onPressLink={series => {
              navigation.push('Series', {
                seriesId: series.id
              })
            }}
            nameExtractor={series => `${series.name} #${series.bookNumber}`}
            style={tw`text-gray-400 dark:text-gray-400`}
            linkStyle={tw`text-gray-400 dark:text-gray-400`}
          />
        </View>
      </View>
    </>
  )
}
