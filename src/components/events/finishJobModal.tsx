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
    const [arriveMashguiachTime, setArriveMashguiachTime] = useState<Date | null>(null)
    const [endMashguiachTime, setEndMashguiachTime] = useState<Date | null>(null)
  
    const handleFinishJob = async () => {
        try {
            if(!arriveMashguiachTime || !endMashguiachTime) return
            const response = await finishAdminService(service.id, arriveMashguiachTime, endMashguiachTime)
            if(response){
                setIsOpen(false)
                onClose()
            }
        } catch (error) {
            
        }
    }

    // Formata a data inicial corretamente ao carregar o modal
    useEffect(() => {
      if (service.arriveMashguiachTime) {
        setArriveMashguiachTime(new Date(service.arriveMashguiachTime))
      }
      if (service.endMashguiachTime) {
        setEndMashguiachTime(new Date(service.endMashguiachTime))
      }
    }, [service])
  
    const handleClose = () => {
      setIsOpen(false)
      onClose()
    }
  
    return (
      <CModal visible={isOpen} onClose={handleClose} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>{serviceId} - Finalizar Serviço do Mashguiach</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol lg={6}>
              <CInputGroup className="mb-3">
                <CDatePicker
                  required
                  timepicker
                  label="Horário de chegada"
                  placeholder={arriveMashguiachTime ? arriveMashguiachTime.toLocaleDateString() : undefined}
                  className="w-100"
                  locale="pt-BR"

                  defaultValue={arriveMashguiachTime?.toISOString()}
                  onDateChange={(date: Date | null) => setArriveMashguiachTime(date)}
                />
              </CInputGroup>
            </CCol>
            <CCol lg={6}>
              <CInputGroup className="mb-3">
                <CDatePicker
                  required
                  timepicker
                  label="Horário de saída"
                  placeholder={endMashguiachTime ? endMashguiachTime.toLocaleDateString() : undefined}
                  className="w-100"
                  locale="pt-BR"
                  defaultValue={endMashguiachTime ? endMashguiachTime.toISOString() : undefined}
                  onDateChange={(date: Date | null) => setEndMashguiachTime(date)}
                />
              </CInputGroup>
            </CCol>
            <CButton onClick={handleFinishJob} color='primary'>Salvar</CButton>
          </CRow>
          
        </CModalBody>
      </CModal>
    )
  }
  
  export default FinishJobModal
  