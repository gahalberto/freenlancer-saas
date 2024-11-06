"use client"
import { getCreditsByUser } from "@/app/_actions/getCreditsByUser"
import { finishService } from "@/app/_actions/services/finishService"
import { getPendingService } from "@/app/_actions/services/getPedingServices"
import { cilDollar } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCard, CCardBody, CCardFooter, CCardText, CToast, CToastHeader, CToastBody, CToaster, CCol, CRow } from "@coreui/react-pro"
import { EventsServices, StoreEvents } from "@prisma/client"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface EventsServiceExtended extends EventsServices {
    StoreEvents: StoreEvents,
    Mashguiach: {
        name: string
    }
}

export default function ServicesTableFinalizar() {
    const [events, setEvents] = useState<EventsServiceExtended[]>([]);
    const [credits, setCredits] = useState(0);

    const { data: session } = useSession() // Sessão do usuário logado


    const fetchCredits = async () => {
        const response = await getCreditsByUser();
        if (response) {
            setCredits(response.credits);
        }
    }

    // Função para buscar os eventos da API
    const fetchEvents = async () => {
        try {
            const response = await getPendingService();
            if (!response) {
                throw new Error(`Erro ao pesquisar Serviços para finalizar`)
            }
            if (response) {
                setEvents(response as any)
            }
            console.log('Eventos carregados:', response)
        } catch (error) {
            console.error('Erro ao buscar eventos:', error)
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchCredits();
    }, [])

    const handleFinishService = async (id: string, amount: number) => {
        finishService(id, amount)
    }

    const [toastList, setToastList] = useState<JSX.Element[]>([]);
    const toaster = useRef<HTMLDivElement>(null);

    const exampleToast = (
        <CToast key={toastList.length}>
            <CToastHeader closeButton>
                <svg
                    className="rounded me-2"
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                    focusable="false"
                    role="img"
                >
                    <rect width="100%" height="100%" fill="#007aff"></rect>
                </svg>
                <div className="fw-bold me-auto">Beit Yaakov - Ashgachot</div>
                <small>1 seg atrás</small>
            </CToastHeader>
            <CToastBody>Você aceitou o serviço!</CToastBody>
        </CToast>
    );

    // Função para adicionar o toast
    const addToast = () => {
        setToastList([...toastList, exampleToast]);
    };

    return (
        <>
            <CRow xs={{ cols: 1, gutter: 4 }} md={{ cols: 2 }}>
                {events.map((item) => {
                    // Calcular o total a pagar com base nas horas de trabalho
                    const start = new Date(item.reallyMashguiachArrive as Date);
                    const end = new Date(item.reallyMashguiachEndTime as Date);

                    // Diferença em milissegundos
                    const diffInMs = end.getTime() - start.getTime();

                    // Convertendo milissegundos para horas e minutos
                    const totalHours = Math.floor(diffInMs / (1000 * 60 * 60)); // Horas completas
                    const totalMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60)); // Minutos restantes

                    // Cálculo do total a pagar (horas + fração de minutos)
                    const totalToPay = (item.mashguiachPricePerHour * (totalHours + totalMinutes / 60) - item.mashguiachPrice);

                    return (
                        <CCol xs key={item.id}>
                            <CCard>
                                <CCardBody>
                                    <CCardText>
                                        <p><b>Evento:</b><small> {item.StoreEvents.title}</small></p>
                                        <p><b>Pagamento:</b><small> R$ {item.mashguiachPrice} </small> </p>
                                        <p><b>Horário previsto de check-in: </b> {new Date(item.arriveMashguiachTime).toLocaleString()}</p>
                                        <p><b>Horário do Check-in:</b>
                                            {item.reallyMashguiachArrive && (
                                                <>
                                                    {new Date(item.reallyMashguiachArrive).toLocaleString('pt-BR')}
                                                </>
                                            )}
                                        </p>

                                        <p><b>Horário previsto de check-out: </b> {new Date(item.endMashguiachTime).toLocaleString()}</p>

                                        <p><b>Horário do Check-out:</b>
                                            {item.reallyMashguiachEndTime && (
                                                <>
                                                    {new Date(item.reallyMashguiachEndTime).toLocaleString('pt-BR')}
                                                </>
                                            )}
                                        </p>
                                        <p><b>Total de horas: </b>
                                            {item.reallyMashguiachArrive && item.reallyMashguiachEndTime && (
                                                <>
                                                    {totalHours} horas e {totalMinutes} minutos
                                                </>
                                            )}
                                        </p>

                                        <p><b>Valor Reservado: </b> R$ {item.mashguiachPrice}</p>
                                        <p><b>Total a pagar: </b> R$ {totalToPay.toFixed(2)}</p>
                                        <p><b>Mashguiach:</b> <small>{item.Mashguiach.name}</small> </p>
                                        <p><b>Data: </b><small>{new Date(item.arriveMashguiachTime).toLocaleDateString()}</small></p>
                                    </CCardText>
                                </CCardBody>
                                <CCardFooter>
                                    {(totalToPay > credits ? (
                                        <Link href={`/credits`}>
                                            <CButton color="danger" size="sm">
                                                <CIcon icon={cilDollar} /> Você não tem crédito suficiente, adicione créditos
                                            </CButton>
                                        </Link>
                                    ) : (
                                        <CButton color="primary" onClick={() => handleFinishService(item.id, totalToPay)}> Finalizar Serviço</CButton>
                                    ))}
                                </CCardFooter>
                            </CCard>
                        </CCol>
                    );
                })}
            </CRow>
            <CToaster className="p-3" placement="top-end" ref={toaster}>
                {toastList}
            </CToaster>
        </>
    )
}
