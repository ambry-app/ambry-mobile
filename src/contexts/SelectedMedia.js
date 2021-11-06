import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useContext, useEffect, useState } from 'react'

const SelectedMediaContext = createContext({})

const SelectedMediaProvider = ({ children }) => {
  const [selectedMediaID, setSelectedMediaID] = useState()

  async function loadStoredState () {
    try {
      console.debug(
        'SelectedMediaContext: loading selectedMediaID from AsyncStorage'
      )
      const selectedMediaIDString = await AsyncStorage.getItem(
        'selectedMediaID'
      )

      if (!selectedMediaIDString) {
        console.debug('SelectedMediaContext: no selectedMediaID found')
        setSelectedMediaID(null)
        return
      }

      const id = parseInt(selectedMediaIDString)
      console.debug(
        `SelectedMediaContext: restored selectedMediaID ${id} from AsyncStorage`
      )

      setSelectedMediaID(id)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadStoredState()
  }, [])

  useEffect(() => {
    if (selectedMediaID) {
      console.debug(
        `SelectedMediaContext: storing selectedMediaID ${selectedMediaID} into AsyncStorage`
      )
      AsyncStorage.setItem('selectedMediaID', selectedMediaID.toString())
    }
  }, [selectedMediaID])

  return (
    <SelectedMediaContext.Provider
      value={{ selectedMediaID, loadMedia: setSelectedMediaID }}
    >
      {children}
    </SelectedMediaContext.Provider>
  )
}

function useSelectedMedia () {
  const context = useContext(SelectedMediaContext)

  if (!context) {
    throw new Error(
      'useSelectedMedia must be used within an SelectedMediaProvider'
    )
  }

  return context
}

export { SelectedMediaContext, SelectedMediaProvider, useSelectedMedia }
