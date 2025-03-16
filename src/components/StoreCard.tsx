import { 
  CCard, 
  CCardBody, 
  CCardImage, 
  CCardTitle, 
  CCardText, 
  CButton 
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilPhone } from '@coreui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils } from '@fortawesome/free-solid-svg-icons'

interface Store {
  id: string
  title: string
  address_city: string
  address_state: string
  address_street: string
  address_number: string
  address_neighbor: string
  phone: string
  comercialPhone: string
  imageUrl: string | null
  menuUrl: string | null
  storeType: {
    title: string
  }
  Certifications: any[]
}

interface StoreCardProps {
  store: Store
  onClick: (id: string) => void
}

const StoreCard = ({ store, onClick }: StoreCardProps) => {
  return (
    <CCard 
      className="h-100 shadow-sm hover-card" 
      onClick={() => onClick(store.id)}
      style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
    >
      <CCardImage 
        orientation="top" 
        src={store.imageUrl || '/images/default-store.jpg'} 
        style={{ height: '180px', objectFit: 'cover' }}
      />
      <CCardBody>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <CCardTitle>{store.title}</CCardTitle>
          {store.Certifications && store.Certifications.length > 0 && (
            <span className="badge bg-success">Certificado</span>
          )}
        </div>
        
        <div className="mb-2 text-muted small">
          <FontAwesomeIcon icon={faUtensils} className="me-2" />
          {store.storeType?.title || 'Estabelecimento'}
        </div>
        
        <CCardText className="mb-2 small">
          <CIcon icon={cilLocationPin} className="me-2 text-primary" />
          {store.address_street}, {store.address_number} - {store.address_neighbor}, {store.address_city}/{store.address_state}
        </CCardText>
        
        {store.phone && (
          <CCardText className="small">
            <CIcon icon={cilPhone} className="me-2 text-primary" />
            {store.phone}
          </CCardText>
        )}
        
        <div className="d-flex justify-content-end mt-3">
          <CButton 
            color="primary" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick(store.id);
            }}
          >
            Ver detalhes
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default StoreCard 