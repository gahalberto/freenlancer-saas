"use client";

import { useSession } from "next-auth/react";
import { cilAvTimer, cilBadge, cilCalendar, cilClock, cilList, cilPhone, cilPlus, cilStar } from "@coreui/icons";
import DangerAlert from "@/components/alerts/DangerAlert";
import MashguiachButtonGroup from "@/components/dashboard/MashguiachButtonGroupt";
import { CButton, CCard, CCardBody, CCardHeader, CCardTitle, CCol, CDatePicker, CFormLabel, CModal, CModalBody, CModalHeader, CRow, CToast, CToastBody, CToastClose, CToaster, CToastHeader } from "@coreui/react-pro";
import CIcon from "@coreui/icons-react";
import { getServicesByDate } from "@/app/_actions/services/getServicesdByDate";
import { useEffect, useRef, useState } from "react";
import { EventsServices, StoreEvents } from "@prisma/client";
import { EventApi } from "@fullcalendar/core";
import { confirmExit } from "@/app/_actions/events/confirmExitTime";
import { confirmEntrance } from "@/app/_actions/events/confirmHours";
import Link from "next/link";

// Extender o tipo EventsServices para incluir StoreEvents
interface EventsServicesWithStoreEvents extends EventsServices {
  StoreEvents: StoreEvents; // Adiciona a relação StoreEvents
}


export default function MashguiachDashboard() {
  // Chamar o hook `useSession` primeiro, sem condicional
  const { data: session, status } = useSession();

  // Definimos os hooks de estado, sem condicional
  const [serviceData, setServiceData] = useState<EventsServicesWithStoreEvents[] | null>(null);
  const [arriveMashguiachTime, setArriveMashguiachTime] = useState<Date | null>(new Date());
  const [endMashguiachTime, setEndMashguiachTime] = useState<Date | null>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null)
  const [visible, setVisible] = useState(false)
  const [toast, addToast] = useState(0)
  const toaster = useRef();

  const exampleToast = (
    <CToast autohide={false} visible={true} color="primary" className="text-white align-items-center">
      <div className="d-flex">
        <CToastBody>✅ Check-in/Check-out feito com sucesso.</CToastBody>
        <CToastClose className="me-2 m-auto" white />
      </div>
    </CToast>
  )


  // Hook para buscar eventos quando o componente é montado
  useEffect(() => {
    const fetchEvents = async () => {
      const today = new Date(); // Pega a data atual
      const response = await getServicesByDate(today); // Passa a data atual para a função
      if (response.length > 0) {
        setServiceData(response);
      }
      console.log(response); // Exibe a resposta ou trata os dados
      if (response.length === 0) {
        console.log("Não há dados para mostrar");
      }
    };

    fetchEvents(); // Chama a função apenas quando o componente é montado
  }, [arriveMashguiachTime, selectedEvent]);

  // Exibe uma mensagem de carregamento até que o status da sessão seja "authenticated"
  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  // Verifica se o usuário não está autenticado
  if (status === "unauthenticated") {
    return <p>Usuário não autenticado</p>;
  }

  // Quando a sessão está autenticada, podemos usar os valores da sessão
  const userName = session?.user?.name || "Usuário";
  const hasAnsweredQuestions = session?.user?.asweredQuestions || false;

  const handleConfirmEntrance = async (item: any) => {
    setSelectedEvent(item)
    setVisible(true)
  }

  const handleSaveEntrace = async (id: string) => {
    const utcDate = new Date(arriveMashguiachTime as Date).toISOString(); // Converte para UTC
    await confirmEntrance(id, new Date(utcDate));
    setSelectedEvent(null);
    setVisible(false);
    addToast(exampleToast as any);
  };

  const handleSaveExit = async (id: any) => {
    confirmExit(id, endMashguiachTime as Date)
    setSelectedEvent(null)
    setVisible(false);
    addToast(exampleToast as any)

  }


  return (
    <>
      {!hasAnsweredQuestions && <DangerAlert msg={`Olá ${userName}, vimos que você ainda não respondeu o questionário do Mashguiach!`} />
      }

      {/* Agrupando os cards em um único CRow */}
      <CRow>
        {serviceData?.map(item => (
          <>
            {(!item.reallyMashguiachArrive || !item.reallyMashguiachEndTime) && (
              <CCol xs={12} sm={12} md={12}>
                <CCard
                  textBgColor="warning"
                  className="mb-3  transition duration-300 hover:bg-blue-500 hover:text-white" // Classe Tailwind para mudar cor no hover
                  textColor="dark"
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")} // Efeito de zoom ao passar o mouse
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} // Remove o efeito ao retirar o mouse
                >
                  <CCardHeader>
                    <CCardTitle>Check-in/Check-out</CCardTitle>
                  </CCardHeader>
                  <CCardBody className="flex justify-center text-center items-center">
                    <p><b>Evento:</b> {item.StoreEvents?.title} | <b> Responsavél:</b> {item.StoreEvents?.responsable}
                      | <b> Endereço:</b> {item.StoreEvents?.address}</p>
                    <Link href={`https://wa.me/${item.StoreEvents.responsableTelephone}`}>
                      <CButton size="sm" color="primary"><CIcon icon={cilPhone} />  Chamar o responsável no whatsapp: {item.StoreEvents.responsableTelephone}</CButton>
                    </Link>
                    <p className="mt-3"><b>Entrada prevista:</b> {new Date(item.arriveMashguiachTime).toLocaleString('pt-BR')}</p>
                    <p><b>Entrada prevista:</b> {new Date(item.endMashguiachTime).toLocaleString('pt-BR')}</p>
                    <CButton color="light" size="sm" className="mt-2" onClick={() => handleConfirmEntrance(item.id)}>
                      <CIcon icon={cilClock} /> Confirmar horário de entrada/saída
                    </CButton>

                  </CCardBody>
                </CCard>
              </CCol>
            )}

            <CModal visible={visible} onClose={() => setVisible(false)}>
              <CModalHeader closeButton>Detalhes do Evento</CModalHeader>
              <CModalBody>
                {selectedEvent ? (
                  <>
                    <CFormLabel>Confirmar Horário de <b>Entrada</b>:</CFormLabel>
                    <CDatePicker
                      timepicker
                      locale="pt-BR"
                      onDateChange={(date: Date | null) => {
                        if (date) {
                          const selectedDate = new Date(date);
                          setArriveMashguiachTime(selectedDate);  // Atualiza o estado com a data e hora selecionada
                        }
                      }}
                    />
                    <CCol md={12} className="text-center mt-3">
                      <CButton color="info" size="sm" className="mt-2" onClick={() => handleSaveEntrace(item.id)}>
                        <CIcon icon={cilClock} /> Confirmar horário de Entrada
                      </CButton>
                    </CCol>

                    <CFormLabel className="mt-4">Confirmar Horário de <b>Saída</b>:</CFormLabel>
                    <CDatePicker
                      timepicker
                      locale="pt-BR"
                      onDateChange={(date: Date | null) => {
                        if (date) {
                          const selectedDate = new Date(date);
                          setEndMashguiachTime(selectedDate);  // Atualiza o estado com a data e hora selecionada
                        }
                      }}
                    />
                    <CCol md={12} className="text-center mt-3">
                      <CButton color="dark" size="sm" className="mt-2" onClick={() => handleSaveExit(item.id)}>
                        <CIcon icon={cilClock} /> Confirmar horário de Saída
                      </CButton>
                    </CCol>

                  </>
                ) : (
                  <p>Nenhum evento selecionado.</p>
                )}
              </CModalBody>
            </CModal>

          </>
        ))}
      </CRow>

      <CRow style={{ justifyItems: 'center', alignItems: 'center' }}>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url="/services" title="Freelancers Disponíveis" textColor="white" icon={cilBadge} color="primary" />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url="/mashguiach/freelancers" title="Calendário de Eventos" textColor="white" icon={cilCalendar} color="primary" />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url="/relatorios" title="Relatórios" textColor="white" icon={cilList} color="primary" />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url="relatorios/create" title="Criar Relatório" textColor="white" icon={cilPlus} color="primary" />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url="/courses" title="Cursos" textColor="white" icon={cilStar} color="primary" />
        </CCol>
      </CRow>
      <CToaster className="p-3" placement="top-end" push={toast as any} ref={toaster as any} />

    </>
  );
}
