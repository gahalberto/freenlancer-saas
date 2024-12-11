import { CButton, CCard, CCardBody, CCardImage, CCardText, CCardTitle } from '@coreui/react-pro'
import { Stores } from '@prisma/client'
interface StoreItemProps {
  store: {
    id: string
    title: string
    address_zipcode: string
    address_street: string
    address_number: string
    address_neighbor: string
    address_city: string
    address_state: string
    userId: string | null
    isAutomated: boolean | null
    isMashguiach: boolean | null
    mashguiachId: string | null
    storeTypeId: string
  }
}

const StoreItem = (store: StoreItemProps) => {
  return (
    <CCard style={{ width: '18rem' }}>
      <CCardImage orientation="top" src={`/images/react.jpg`} />
      <CCardBody>
        <CCardTitle>{store.store.title}</CCardTitle>
        <CCardText>Certificado em: 11/2023 até 11/2025</CCardText>
        <CButton color="primary" href="#">
          Certificado de Kashrut
        </CButton>
      </CCardBody>
    </CCard>
  )
}

export default StoreItem
