import { finishAdminService } from '@/app/_actions/services/finishAdminService'
import {
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CInputGroup,
    CRow,
    CCol,
    CDatePicker,
    CButton,
  } from '@coreui/react-pro'
  import { EventsServices } from '@prisma/client'
  import { useState, useEffect } from 'react'
  
  interface FinishJobModalProps {
    onClose: () => void
    service: EventsServices
    serviceId: string
  }
  
  const FinishJobModal = ({ onClose, service, serviceId }: FinishJobModalProps) => {
    const [isOpen, setIsOpen] = useState(true)
    const [paymentDate, setPaymentDate] = useState<Date | null>(null)
  
    const handleFinishJob = async () => {
        try {
            if(!paymentDate) return
            const response = await finishAdminService(service.id, paymentDate)
            if(response){
                setIsOpen(false)
                onClose()
            }
        } catch (error) {
            
        }
    }

    // Formata a data inicial corretamente ao carregar o modal
    useEffect(() => {
      if (service.paymentDate) {
        setPaymentDate(new Date(service.paymentDate))
      }
    }, [service])
  
    const handleClose = () => {
      setIsOpen(false)
      onClose()
    }
  
    return (
      <CModal visible={isOpen} onClose={handleClose} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>O servico já foi finalizado? Já foi pago?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol lg={6}>
              <CInputGroup className="mb-3">
                <CDatePicker
                  required
                  timepicker
                  label="Dia do pagamento:"
                  className="w-100"
                  locale="pt-BR"

                  defaultValue={paymentDate?.toISOString()}
                  onDateChange={(date: Date | null) => setPaymentDate(date)}
                />
              </CInputGroup>
            </CCol>
            <CButton onClick={handleFinishJob} color='primary'>Confirmar pagamento</CButton>
          </CRow>
          
        </CModalBody>
      </CModal>
    )
  }
  
  export default FinishJobModal
  