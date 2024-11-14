import { CBadge, CButton, CFormLabel, CModal, CModalBody, CModalHeader } from "@coreui/react-pro";
import { EventApi } from "@fullcalendar/core";
import { EventsServices, StoreEvents } from "@prisma/client";
import Map from "../googleMaps";
import Link from "next/link";
import CIcon from "@coreui/icons-react";
import { cilPhone } from "@coreui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

type Props = {
    visible: boolean;
    onClose: () => void;
    selectedEvent: EventsServicesWithStoreEvents | null;
};

// Extender o tipo EventsServices para incluir StoreEvents
interface EventsServicesWithStoreEvents extends EventsServices {
    StoreEvents: StoreEvents; // Adiciona a relação StoreEvents
}


const EventInfoModal = ({ visible, onClose, selectedEvent }: Props) => {
    return (
        <CModal visible={visible} onClose={onClose}>
            <CModalHeader closeButton>Detalhes do Evento</CModalHeader>
            <CModalBody>
                {selectedEvent ? (
                    <>
                        <CFormLabel><b>Nome:</b> {selectedEvent.StoreEvents.title}</CFormLabel>
                        <CFormLabel><b>Entrada prevista:</b>  {new Date(selectedEvent.arriveMashguiachTime).toLocaleString('pt-BR')}</CFormLabel>
                        <CFormLabel><b>Saída prevista: </b> {new Date(selectedEvent.endMashguiachTime).toLocaleString('pt-BR')}</CFormLabel>
                        <CFormLabel><b>Responsável: </b> {selectedEvent.StoreEvents.responsable}
                            <Link href={`https://wa.me/${selectedEvent.StoreEvents.responsableTelephone}`}>
                                <CBadge className="" style={{ marginLeft: 10 }} color="success">
                                    <FontAwesomeIcon icon={faWhatsapp} style={{ marginRight: 10 }} />
                                    WhatsApp do Responsável
                                </CBadge>
                            </Link>
                        </CFormLabel>
                        <CFormLabel><b>Endereço:</b> {selectedEvent.StoreEvents.address_street} {selectedEvent.StoreEvents.address_number} -
                            CEP: {selectedEvent.StoreEvents.address_zicode}
                        </CFormLabel>
                        <Map zipcode={selectedEvent.StoreEvents.address_zicode} showButtons={true} />
                    </>
                ) : (
                    <p>Nenhum evento selecionado.</p>
                )}
            </CModalBody>
        </CModal>
    );
};

export default EventInfoModal;
