'use client'

import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react-pro'
import { brandSet } from '@coreui/icons'

import { getIconsView } from '../IconsView'

const CoreUIIcons = () => {
  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Brand Icons</CCardHeader>
        <CCardBody>
          <CRow className="text-center">{getIconsView(brandSet)}</CRow>
        </CCardBody>
      </CCard>
    </>
  )
}

export default CoreUIIcons
