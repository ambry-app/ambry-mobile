import React from 'react'

import ScreenCentered from './ScreenCentered'
import LargeActivityIndicator from './LargeActivityIndicator'

export const Loading = () => {
  return (
    <ScreenCentered>
      <LargeActivityIndicator />
    </ScreenCentered>
  )
}
