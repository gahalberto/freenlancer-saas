"use client"
import { getServicesCount } from "@/app/_actions/services/getServicesCount"
import { CButton, CCard, CCardBody, CCardFooter, CCardText, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle, CCloseButton, CCol, CRow, CBadge, CToast, CToastHeader, CToastBody, CToaster, CDropdownDivider, CHeaderDivider, CHeader, CCardTitle, CCardHeader } from "@coreui/react-pro"
import { StoreEvents } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import Map from "../googleMaps"

interface Service {
    id: string;
    arriveMashguiachTime: Date;
    endMashguiachTime: Date;
    mashguiachPrice: number;
    observationText?: string;
}


export default function ServicesTable() {
    const [events, setEvents] = useState<StoreEvents[]>([])
    const [visible, setVisible] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<StoreEvents | null>(null) // Evento selecionado
    const [servicesCount, setServicesCount] = useState<{ [key: string]: number }>({}) // Contagem de serviços por evento
    const { data: session } = useSession() // Sessão do usuário logado
    const [address, setAddress] = useState("");
    // Função para buscar os eventos da API
    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events/getAllEvents')
            if (!response.ok) {
                throw new Error(`Erro: ${response.status} - ${response.statusText}`)
            }
            const data = await response.json()
            setEvents(data)
            // Busca a contagem de serviços para cada evento
            data.forEach(async (event: StoreEvents) => {
                const count = await getServicesCount(event.id);
                setServicesCount(prevState => ({
                    ...prevState,
                    [event.id]: count,
                }));
            });
        } catch (error) {
            console.error('Erro ao buscar eventos:', error)
        }
    };

    useEffect(() => {
        fetchEvents()
    }, [])

    // Função para abrir o Offcanvas e definir o evento selecionado
    const handleShowDetails = (event: StoreEvents) => {
        setSelectedEvent(event)
        setVisible(true)
        console.log('Evento selecionado:', event)
    }

    const handleGetJob = async (id: string) => {
        const mashguiachId = session?.user.id; // ID do usuário da sessão

        if (confirm('Você tem certeza que deseja confirmar esse serviço?')) {
            try {
                const response = await fetch('/api/events/updateNewService', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id,  // Passa o ID do serviço para a API
                        mashguiachId
                    }),
                })

                if (response.ok) {
                    setVisible(false)
                    fetchEvents();
                    addToast();  // Adiciona o toast de confirmação

                    const whatsapp = await fetch('https://graph.facebook.com/v21.0/409640815575363/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer EAAVdEBsjVVIBO8XQ8G80ZBfSN8JMZC6ZBBHbZB0oua3ZBLdXlrYeKZC36KEezqbxZCZCcRreugx2meg7nctBff4q8SZAtFJIyxmz0JAidZBj03ZAfE4aKNnGHAZAxgrUQ887GbdIdT4mZA2nKQC0RQQ0bvGZABAY3aItf0K5fMHPn6rxE6VHwsESUofFFt2D5glXQS58C4HilG4WRyHhCDanxuudMIi4lrKFV2EWKl15WJaQeGCGQZD'
                        },
                        body: JSON.stringify(
                            {
                                "messaging_product": "whatsapp",
                                "recipient_type": "individual",
                                "to": "5511994917885",
                                "type": "text",
                                "text": {
                                    "preview_url": false,
                                    "body": `Mashguiach(a), você confirmou um serviço. *Evento:* Casamento do Duda, você precisa chegar no dia 25/11/2024 7h00 até as 16h00! Bom serviço! `
                                }
                            }
                        )
                    })
                }
            } catch (error) {
                console.error('Erro ao pegar o serviço:', error);
            }
        }
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
                {events
                    // Filtra os eventos que têm serviços disponíveis
                    .filter(item => servicesCount[item.id] > 0)
                    .map(item => (
                        <CCol xs key={item.id}>
                            <CCard>
                                <CCardBody>
                                    <CCardText>
                                        <p><b>Evento:</b><small> {item.title} - <CBadge color="primary">{item.eventType}</CBadge></small></p>
                                        <p><b>Endereço:</b><small>  {item.address_street} {item.address_number}, {item.address_zicode} </small> | <b>Data: </b><small>
                                            {new Date(item.date).toLocaleDateString('pt-BR')}
                                        </small></p>
                                    </CCardText>
                                </CCardBody>
                                <CCardFooter>
                                    <CButton color="primary" onClick={() => handleShowDetails(item)}>+{servicesCount[item.id]} serviços disponíveis</CButton>
                                </CCardFooter>
                            </CCard>
                        </CCol>
                    ))}
            </CRow>

            <COffcanvas backdrop="static" placement="start" visible={visible} onHide={() => setVisible(false)}>
                <COffcanvasHeader>
                    <COffcanvasTitle>Freelancers Disponíveis</COffcanvasTitle>
                    <CCloseButton className="text-reset" onClick={() => setVisible(false)} />
                </COffcanvasHeader>
                <COffcanvasBody>
                    {selectedEvent ? (
                        <>
                            {/* Renderizando os serviços do evento */}
                            <CHeaderDivider />
                            {selectedEvent?.EventsServices?.map((service: Service, index: number) => (
                                <div key={service.id}>
                                    <CCard color="light" className="text-left" style={{ marginBottom: '10px' }}>
                                        <CCardBody>
                                            <CCardText>
                                                <p><b>Dia:</b> {new Date(service.endMashguiachTime).toLocaleDateString('pt-BR')}</p>
                                                <p><b>Entrada prevista:</b> {new Date(service.arriveMashguiachTime).toLocaleTimeString('pt-BR')}</p>
                                                <p><b>Saída prevista:</b> {new Date(service.endMashguiachTime).toLocaleTimeString('pt-BR')}</p>
                                                <p><b>Preço do Mashguiach:</b> R${service.mashguiachPrice.toFixed(2)}</p>
                                                {service.observationText && <p><b>Observações:</b> {service.observationText}</p>}
                                            </CCardText>
                                        </CCardBody>
                                        <CCardFooter>
                                            <CButton color="primary" onClick={() => handleGetJob(service.id)}>Pegar Serviço</CButton>
                                        </CCardFooter>
                                    </CCard>
                                </div>
                            ))}
                        </>
                    ) : (
                        <p>Nenhum evento selecionado.</p>
                    )}
                </COffcanvasBody>
            </COffcanvas>

            <CToaster className="p-3" placement="top-end" ref={toaster}>
                {toastList}
            </CToaster>
        </>
    )
}
