import { CButton, CCard, CCardBody, CCardImage, CCardText, CCardTitle } from '@coreui/react-pro'

const StoreItem = () => {
  return (
    <CCard style={{ width: '18rem' }}>
      <CCardImage orientation="top" src={`/images/react.jpg`} />
      <CCardBody>
        <CCardTitle>Card title</CCardTitle>
        <CCardText>
          Some quick example text to build on the card title and make up the bulk of the cards
          content.
        </CCardText>
        <CButton color="primary" href="#">
          Go somewhere
        </CButton>
      </CCardBody>
    </CCard>
  )
}

export default StoreItem
