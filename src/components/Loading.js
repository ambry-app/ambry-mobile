import React from 'react'
import LargeActivityIndicator from './LargeActivityIndicator'
import ScreenCentered from './ScreenCentered'

export const Loading = () => {
  return (
    <ScreenCentered>
      <LargeActivityIndicator />
    </ScreenCentered>
  )
}
