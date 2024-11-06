"use client"

import { aproveEvent } from "@/app/_actions/events/aproveEvent";
import { getEventInfo } from "@/app/_actions/events/getEventInfo";
import ButtonCompo from "@/components/CButtonCom";
import { EventsTableByEvent } from "@/components/events/eventsTable";
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCardImage, CCardText, CCardTitle, CCol, CDatePicker, CFormInput, CFormLabel, CPlaceholder, CRow } from "@coreui/react-pro";
import { StoreEvents } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ParamsType {
    params: {
        id: string;
    }
}

interface EventWithOwner extends StoreEvents {
    eventOwner: {
        name: string;
    },
    responsableTelephone: string;
}

const EditEventPage = ({ params }: ParamsType) => {
    const { data: session, status } = useSession();
    const [disabled, setDisabled] = useState(true);
    const [event, setEvent] = useState<EventWithOwner | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Estado para a data selecionada

    const fetchEvent = async () => {
        const response = await getEventInfo(params.id);
        if (response) {
            setEvent(response as any);
            setSelectedDate(new Date(response.date)); // Definir a data inicial a partir dos dados do evento
        }
    };

    const handleAproveEvent = async (eventId: string, isApproved: boolean) => {
        // Chama a função de aprovação e alterna o estado de aprovação
        const updatedEvent = await aproveEvent(eventId, !isApproved);
        if (updatedEvent) {
            // Atualiza o estado do evento localmente após a aprovação/trancamento
            setEvent((prevEvent) => prevEvent ? { ...prevEvent, isApproved: !prevEvent.isApproved } : prevEvent);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [params.id]);

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            Evento criado por: <strong>{event?.eventOwner?.name} </strong>
                        </div>

                        {session?.user.roleId === 3 && (
                            <CButton onClick={() => handleAproveEvent(event?.id as string, event?.isApproved as boolean)} color="primary">
                                {event?.isApproved ? 'Trancar evento' : 'Liberar evento'}
                            </CButton>
                        )}
                    </CCardHeader>
                    <CCardBody>
                        <p className="text-body-secondary small">
                            Edite os dados do evento. Após a edição, os dados serão atualizados.
                        </p>
                        <CRow>
                            <CCol md={6}>
                                <CFormLabel>Nome do Evento:</CFormLabel>
                                <CFormInput
                                    type="text"
                                    disabled={disabled}
                                    value={event?.title || ""}
                                />
                            </CCol>

                            <CCol md={3}>
                                <CFormLabel>Responsável pelo Evento:</CFormLabel>
                                <CFormInput
                                    type="text"
                                    disabled={disabled}
                                    value={event?.responsable || ""}
                                />
                            </CCol>

                            <CCol md={3}>
                                <CFormLabel>Telefone do Responsável:</CFormLabel>
                                <CFormInput
                                    type="text"
                                    disabled={disabled}
                                    value={event?.responsableTelephone || ""}
                                />
                            </CCol>
                        </CRow>

                        <CRow>
                            <CCol md={12}>
                                <CFormLabel>Endereço do Evento:</CFormLabel>
                                <CFormInput
                                    type="text"
                                    disabled={disabled}
                                    value={event?.address || ""}
                                />
                            </CCol>
                        </CRow>

                        <CRow>
                            <CCol md={6}>
                                <CFormLabel>Tipo do Evento:</CFormLabel>
                                <CFormInput
                                    type="text"
                                    disabled={disabled}
                                    value={event?.eventType || ""}
                                />
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel>Serviço do Evento:</CFormLabel>
                                <CFormInput
                                    type="text"
                                    disabled={disabled}
                                    value={event?.serviceType || ""}
                                />
                            </CCol>
                        </CRow>

                        <CRow>
                            <CCol md={6}>
                                <CFormLabel>Dia do Evento:</CFormLabel>
                                <CDatePicker
                                    disabled={disabled}
                                    onDateChange={(date) => setSelectedDate(date)} // Atualiza a data selecionada
                                    date={selectedDate || undefined} // Define a data inicial
                                />
                            </CCol>

                            <CCol md={6}>
                                <CFormLabel>Qtd de Pax:</CFormLabel>
                                <CFormInput
                                    type="number"
                                    disabled={disabled}
                                    value={event?.nrPax || ""}
                                />
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>

                {/* Renderiza o EventsTableByEvent apenas se o event.id estiver definido */}
                {event?.isApproved ? (
                    <EventsTableByEvent eventStoreId={event.id} />
                ) : (
                    <>
                        <CCard style={{ width: '100%' }}>
                            <CCardBody>
                                <CPlaceholder as={CCardTitle} animation="glow" xs={7}>
                                    <CBadge color="danger">Esse Evento ainda não foi aprovado pelo rabino!</CBadge>
                                    <CPlaceholder xs={6} />
                                </CPlaceholder>
                                <CPlaceholder as={CCardText} animation="glow">
                                    <CPlaceholder xs={7} />
                                    <CPlaceholder xs={4} />
                                    <CPlaceholder xs={4} />
                                    <CPlaceholder xs={6} />
                                    <CPlaceholder xs={8} />
                                </CPlaceholder>
                                <CPlaceholder as={CButton} color="primary" disabled href="#" tabIndex={-1} xs={6}></CPlaceholder>
                            </CCardBody>
                        </CCard>

                    </>
                )}

            </CCol>
        </CRow>
    );
}

export default EditEventPage;
