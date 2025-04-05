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
    CFormLabel,
    CFormInput,
    CCard,
    CCardBody,
    CCardHeader,
    CAlert,
  } from '@coreui/react-pro'
  import { EventsServices, StoreEvents, User } from '@prisma/client'
  import { useState, useEffect } from 'react'
  
  // Interface para estender o EventsServices com as relações
  interface EventsServiceWithRelations extends EventsServices {
    StoreEvents?: StoreEvents
    Mashguiach?: User | null
  }
  
  interface FinishJobModalProps {
    onClose: () => void
    service: EventsServiceWithRelations
    serviceId: string
  }
  
  const FinishJobModal = ({ onClose, service, serviceId }: FinishJobModalProps) => {
    const [isOpen, setIsOpen] = useState(true)
    const [paymentDate, setPaymentDate] = useState<Date | null>(null)
    const [dayHourValue, setDayHourValue] = useState<number>(service.dayHourValue || 50)
    const [nightHourValue, setNightHourValue] = useState<number>(service.nightHourValue || 75)
    const [transportPrice, setTransportPrice] = useState<number>(service.transport_price || 0)
    const [summary, setSummary] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
    // Calcular resumo dos valores ao carregar e quando os valores mudam
    useEffect(() => {
      calculateSummary()
    }, [dayHourValue, nightHourValue, transportPrice])
  
    // Calcular o resumo dos valores
    const calculateSummary = () => {
      try {
        const startTime = new Date(service.arriveMashguiachTime)
        const endTime = new Date(service.endMashguiachTime)
        
        // Verificar se as datas são válidas
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime >= endTime) {
          setSummary({
            dayHours: 0,
            nightHours: 0,
            dayValue: 0,
            nightValue: 0,
            totalHours: 0,
            subtotal: 0,
            transport: transportPrice,
            total: transportPrice
          })
          return
        }
  
        // Calcular horas diurnas e noturnas
        const hours = calculateDayAndNightHours(startTime, endTime)
        
        // Calcular valores
        const dayValue = hours.dayHours * dayHourValue
        const nightValue = hours.nightHours * nightHourValue
        let subtotal = dayValue + nightValue
        
        // Aplicar valor mínimo se necessário
        if (subtotal < 250) {
          subtotal = 250
        }
        
        // Total com transporte
        const total = subtotal + transportPrice
        
        // Diferença em horas
        const diffInMs = endTime.getTime() - startTime.getTime()
        const totalHours = diffInMs / (1000 * 60 * 60)
        
        setSummary({
          dayHours: hours.dayHours.toFixed(2),
          nightHours: hours.nightHours.toFixed(2),
          dayValue: dayValue.toFixed(2),
          nightValue: nightValue.toFixed(2),
          totalHours: totalHours.toFixed(2),
          subtotal: subtotal.toFixed(2),
          transport: transportPrice.toFixed(2),
          total: total.toFixed(2)
        })
      } catch (error) {
        console.error("Erro ao calcular resumo:", error)
        setErrorMessage("Erro ao calcular os valores. Verifique os dados e tente novamente.")
      }
    }
  
    const handleFinishJob = async () => {
      try {
        if (!paymentDate) {
          setErrorMessage("Por favor, selecione a data de pagamento.")
          return
        }
        
        const response = await finishAdminService(
          service.id, 
          paymentDate, 
          dayHourValue, 
          nightHourValue, 
          transportPrice
        )
        
        if (response) {
          setIsOpen(false)
          onClose()
        }
      } catch (error) {
        console.error("Erro ao finalizar serviço:", error)
        setErrorMessage("Ocorreu um erro ao finalizar o serviço. Tente novamente.")
      }
    }
  
    // Formata a data inicial corretamente ao carregar o modal
    useEffect(() => {
      if (service.paymentDate) {
        setPaymentDate(new Date(service.paymentDate))
      } else {
        setPaymentDate(new Date())
      }
    }, [service])
  
    const handleClose = () => {
      setIsOpen(false)
      onClose()
    }
  
    // Formatar valores para exibição
    const formatCurrency = (value: number | string) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(value))
    }
  
    return (
      <CModal visible={isOpen} onClose={handleClose} size="lg">
        <CModalHeader closeButton>
          <CModalTitle>Finalizar e Confirmar Pagamento</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {errorMessage && (
            <CAlert color="danger" dismissible onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </CAlert>
          )}
          
          <CCard className="mb-4">
            <CCardHeader>
              Resumo do Serviço
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <p><strong>Evento:</strong> {service.StoreEvents?.title || 'Não disponível'}</p>
                  <p><strong>Data:</strong> {new Date(service.arriveMashguiachTime).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {new Date(service.arriveMashguiachTime).toLocaleTimeString('pt-BR')} até {new Date(service.endMashguiachTime).toLocaleTimeString('pt-BR')}</p>
                </CCol>
                <CCol md={6}>
                  <p><strong>Mashguiach:</strong> {service.Mashguiach?.name || 'Não atribuído'}</p>
                  <p><strong>Total de Horas:</strong> {summary?.totalHours || '0'} horas</p>
                  <p><strong>Status:</strong> {service.paymentStatus === 'Success' ? 'Pago' : 'Pendente'}</p>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          
          <CCard className="mb-4">
            <CCardHeader>
              Valores e Ajustes
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel htmlFor="dayHourValue">Valor Hora Diurna (R$):</CFormLabel>
                  <CFormInput
                    id="dayHourValue"
                    type="number"
                    value={dayHourValue}
                    onChange={(e) => setDayHourValue(Number(e.target.value))}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="nightHourValue">Valor Hora Noturna (R$):</CFormLabel>
                  <CFormInput
                    id="nightHourValue"
                    type="number"
                    value={nightHourValue}
                    onChange={(e) => setNightHourValue(Number(e.target.value))}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="transportPrice">Valor do Transporte (R$):</CFormLabel>
                  <CFormInput
                    id="transportPrice"
                    type="number"
                    value={transportPrice}
                    onChange={(e) => setTransportPrice(Number(e.target.value))}
                  />
                </CCol>
              </CRow>
              
              <CRow className="mt-4">
                <CCol md={6}>
                  <h5>Detalhamento:</h5>
                  <p><strong>Horas Diurnas (06h-22h):</strong> {summary?.dayHours || '0'} h</p>
                  <p><strong>Horas Noturnas (22h-06h):</strong> {summary?.nightHours || '0'} h</p>
                  <p><strong>Valor Diurno:</strong> {formatCurrency(summary?.dayValue || 0)}</p>
                  <p><strong>Valor Noturno:</strong> {formatCurrency(summary?.nightValue || 0)}</p>
                </CCol>
                <CCol md={6}>
                  <h5>Totais:</h5>
                  <p><strong>Subtotal:</strong> {formatCurrency(summary?.subtotal || 0)}</p>
                  <p><strong>Transporte:</strong> {formatCurrency(summary?.transport || 0)}</p>
                  <p><strong className="fs-5">Total a Pagar:</strong> {formatCurrency(summary?.total || 0)}</p>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="paymentDate">Data do Pagamento:</CFormLabel>
              <CDatePicker
                id="paymentDate"
                required
                timepicker
                className="w-100"
                locale="pt-BR"
                defaultValue={paymentDate?.toISOString()}
                onDateChange={(date: Date | null) => setPaymentDate(date)}
              />
            </CCol>
          </CRow>
          
          <CRow className="mt-4">
            <CCol className="d-flex justify-content-end gap-2">
              <CButton onClick={handleClose} color="secondary">Cancelar</CButton>
              <CButton onClick={handleFinishJob} color="primary">Confirmar Pagamento</CButton>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>
    )
  }
  
  // Função para calcular horas diurnas e noturnas
  function calculateDayAndNightHours(startTime: Date, endTime: Date): { dayHours: number, nightHours: number } {
    try {
      // Verificar se as datas são válidas
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime >= endTime) {
        return { dayHours: 0, nightHours: 0 };
      }
      
      // Calcular duração total em horas
      const durationMs = endTime.getTime() - startTime.getTime();
      
      // Calcular horas diurnas e noturnas
      let dayHours = 0;
      let nightHours = 0;
      
      // Criar cópia da data de início para iterar
      const currentTime = new Date(startTime);
      
      // Avançar em intervalos de 15 minutos para maior precisão
      const intervalMinutes = 15;
      const intervalMs = intervalMinutes * 60 * 1000;
      const totalIntervals = Math.ceil(durationMs / intervalMs);
      
      for (let i = 0; i < totalIntervals; i++) {
        const hour = currentTime.getHours();
        
        // Verificar se é horário noturno (22h às 6h)
        if (hour >= 22 || hour < 6) {
          nightHours += intervalMinutes / 60;
        } else {
          dayHours += intervalMinutes / 60;
        }
        
        // Avançar para o próximo intervalo
        currentTime.setTime(currentTime.getTime() + intervalMs);
        
        // Se passamos do horário final, ajustar o último intervalo
        if (currentTime > endTime) {
          const overflowMs = currentTime.getTime() - endTime.getTime();
          const overflowHours = overflowMs / (1000 * 60 * 60);
          
          // Subtrair o excesso do tipo de hora apropriado
          const lastHour = new Date(currentTime.getTime() - intervalMs).getHours();
          if (lastHour >= 22 || lastHour < 6) {
            nightHours -= overflowHours;
          } else {
            dayHours -= overflowHours;
          }
        }
      }
      
      // Arredondar para 2 casas decimais e garantir valores não negativos
      dayHours = Math.max(0, parseFloat(dayHours.toFixed(2)));
      nightHours = Math.max(0, parseFloat(nightHours.toFixed(2)));
      
      return { dayHours, nightHours };
    } catch (error) {
      console.error("Erro ao calcular horas diurnas/noturnas:", error);
      return { dayHours: 0, nightHours: 0 };
    }
  }
  
  export default FinishJobModal
  