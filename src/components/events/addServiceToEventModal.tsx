'use client'

import { useEffect, useState } from 'react'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'
import {
  CBadge,
  CButton,
  CCol,
  CForm,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react-pro'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { createEventServices } from '@/app/_actions/events/createEventServices'
import { useSession } from 'next-auth/react'
import { getCreditsByUser } from '@/app/_actions/getCreditsByUser'
import { cilDollar } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import Link from 'next/link'

type PropsType = {
  visible: boolean
  onClose: () => void
  StoreEventsId: string
  fetchAll: () => void
}

const AddServiceToEventModal = ({ fetchAll, visible, onClose, StoreEventsId }: PropsType) => {
  const { data: session, status } = useSession()
  const [credits, setCredits] = useState(0)

  const fetchCredits = async () => {
    const response = await getCreditsByUser()
    if (response) {
      setCredits(response.credits)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  const [arriveMashguiachTime, setArriveMashguiachTime] = useState<Date | undefined>(undefined)
  const [endMashguiachTime, setEndMashguiachTime] = useState<Date | undefined>(undefined)
  const [mashguiachPrice, setMashguiachPrice] = useState<number>(0)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [totalHours, setTotalHours] = useState<number>(0)
  const [observationText, setObservationText] = useState('')

  const calculateHoursBetweenDates = (startDate: Date, endDate: Date) => {
    const differenceInMs = endDate.getTime() - startDate.getTime()
    return differenceInMs / (1000 * 60 * 60)
  }

  useEffect(() => {
    if (arriveMashguiachTime && endMashguiachTime && mashguiachPrice > 0) {
      const hoursWorked = calculateHoursBetweenDates(arriveMashguiachTime, endMashguiachTime)
      setTotalHours(hoursWorked)
      setTotalPrice(hoursWorked * mashguiachPrice)
    }
  }, [arriveMashguiachTime, endMashguiachTime, mashguiachPrice])

  const handleSubmit = async () => {
    if (!arriveMashguiachTime || !endMashguiachTime) {
      alert('Por favor, preencha todas as datas')
      return
    }

    try {
      const response = await createEventServices({
        StoreEventsId,
        arriveMashguiachTime,
        endMashguiachTime,
        isApproved: false,
        mashguiachPrice: totalPrice,
        mashguiachPricePerHour: mashguiachPrice,
        observationText,
      })

      if (response) {
        alert('Formulário enviado com sucesso!')
        fetchAll()
        onClose()
        fetchCredits()
      } else {
        alert('Ocorreu um erro ao enviar o formulário.')
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      alert('Ocorreu um erro ao enviar o formulário.')
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} className="z-10">
      <CForm className="row g-3">
        <CModalHeader>
          <CModalTitle>Solicitar Mashguiach</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CCol md={12}>
            <Popover>
              <PopoverTrigger asChild>
                <CButton color="primary" variant="outline">
                  {arriveMashguiachTime
                    ? `ENTRADA: ${format(
                        arriveMashguiachTime,
                        'dd/MM/yyyy',
                      )} ${arriveMashguiachTime.getHours()}:${arriveMashguiachTime.getMinutes()}`
                    : 'Selecionar entrada'}
                </CButton>
              </PopoverTrigger>
              <PopoverContent
                style={{ zIndex: 2050, alignContent: 'center', alignItems: 'center' }}
                className="z-[1050]"
                sideOffset={5}
                align="center"
                alignOffset={5}
              >
                <div>
                  <Calendar
                    locale={ptBR}
                    mode="single"
                    selected={arriveMashguiachTime}
                    onSelect={(date) => setArriveMashguiachTime(date)}
                    disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <label htmlFor="arrive-time">Horário:</label>
                    <input
                      id="arrive-time"
                      type="time"
                      className="form-control"
                      onChange={(e) => {
                        if (arriveMashguiachTime) {
                          const [hours, minutes] = e.target.value.split(':')
                          const updatedDate = new Date(arriveMashguiachTime)
                          updatedDate.setHours(parseInt(hours, 10))
                          updatedDate.setMinutes(parseInt(minutes, 10))
                          setArriveMashguiachTime(updatedDate)
                        }
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CCol>

          <CCol md={12} style={{ marginTop: '18px' }}>
            <Popover>
              <PopoverTrigger asChild>
                <CButton color="primary" variant="outline">
                  {endMashguiachTime
                    ? `SAÍDA: ${format(
                        endMashguiachTime,
                        'dd/MM/yyyy',
                      )} ${endMashguiachTime.getHours()}:${endMashguiachTime.getMinutes()}`
                    : 'Selecionar saída'}
                </CButton>
              </PopoverTrigger>
              <PopoverContent
                style={{ zIndex: 2050, alignContent: 'center', alignItems: 'center' }}
                className="z-[1050]"
                sideOffset={5}
                align="center"
                alignOffset={5}
              >
                <div>
                  <Calendar
                    locale={ptBR}
                    mode="single"
                    selected={endMashguiachTime}
                    onSelect={(date) => setEndMashguiachTime(date)}
                    disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <label htmlFor="end-time">Horário:</label>
                    <input
                      id="end-time"
                      type="time"
                      className="form-control"
                      onChange={(e) => {
                        if (endMashguiachTime) {
                          const [hours, minutes] = e.target.value.split(':')
                          const updatedDate = new Date(endMashguiachTime)
                          updatedDate.setHours(parseInt(hours, 10))
                          updatedDate.setMinutes(parseInt(minutes, 10))
                          setEndMashguiachTime(updatedDate)
                        }
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </CCol>

          <CCol md={12} style={{ marginTop: '18px' }}>
            <CInputGroup className="mb-3">
              <CInputGroupText>R$</CInputGroupText>
              <input
                type="number"
                className="form-control"
                value={mashguiachPrice}
                onChange={(e) => setMashguiachPrice(Number(e.target.value))}
              />
            </CInputGroup>
          </CCol>

          <CCol md={12}>
            <CFormTextarea
              placeholder="Observação"
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
            ></CFormTextarea>
          </CCol>

          <CCol>
            <CTable>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell>Total de Horas:</CTableDataCell>
                  <CTableDataCell>{totalHours.toFixed(2)}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell>Total a pagar:</CTableDataCell>
                  <CTableDataCell>R$ {totalPrice.toFixed(2)}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCol>
        </CModalBody>
        <CModalFooter>
          <CButton color="success" onClick={handleSubmit}>
            Confirmar
          </CButton>
          <CButton color="secondary" onClick={onClose}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default AddServiceToEventModal
