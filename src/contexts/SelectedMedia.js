import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

const SELECTED_MEDIA_KEY = 'selectedMedia'

const SelectedMediaContext = createContext({})

const SelectedMediaProvider = ({ children }) => {
  const [selectedMedia, setSelectedMedia] = useState()

  async function loadStoredState () {
    try {
      console.debug(
        'SelectedMediaContext: loading selectedMedia from AsyncStorage'
      )
      const selectedMediaString = await AsyncStorage.getItem(SELECTED_MEDIA_KEY)

      if (!selectedMediaString) {
        console.debug('SelectedMediaContext: no selectedMedia found')
        setSelectedMedia(null)
        return
      }

      const selectedMedia = JSON.parse(selectedMediaString)
      console.debug(
        `SelectedMediaContext: restored selectedMedia ${selectedMedia.id} from AsyncStorage`
      )

      setSelectedMedia(selectedMedia)
    } catch (error) {
      console.error(error)
    }
  }

  const loadMedia = useCallback((id, imagePath) => {
    const newSelectedMedia = { id, imagePath }

    console.debug(
      `SelectedMediaContext: storing selectedMedia ${newSelectedMedia.id} into AsyncStorage`
    )
    AsyncStorage.setItem(SELECTED_MEDIA_KEY, JSON.stringify(newSelectedMedia))

    setSelectedMedia(newSelectedMedia)
  }, [])

  const clearMedia = useCallback(() => {
    console.debug(
      `SelectedMediaContext: clearing selectedMedia from AsyncStorage`
    )
    AsyncStorage.removeItem(SELECTED_MEDIA_KEY)
    setSelectedMedia(null)
  }, [])

  useEffect(() => {
    loadStoredState()
  }, [])

  return (
    <SelectedMediaContext.Provider
      value={{ selectedMedia, loadMedia, clearMedia }}
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
