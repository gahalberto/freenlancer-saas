import { CModal, CModalBody, CModalHeader, CModalTitle } from "@coreui/react-pro";
import { useState, useEffect } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CLink,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CTooltip,
} from "@coreui/react-pro";
import { cilTrash } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import AddServiceToEventModal from "./addServiceToEventModal";
import ChangeMashguiachModal from "./ChangeMashguiachModal";
import { getEventServices } from "@/app/_actions/events/getEventsServices";
import { deleteEvent } from "@/app/_actions/events/deleteEvent";
import Link from "next/link";
import { EventsServices } from "@prisma/client";

type PropsType = {
  eventStoreId: string;
};

interface ServiceType extends EventsServices {
  Mashguiach: {
    name: string;
  };
}

export const EventsTableByEvent = ({ eventStoreId }: PropsType) => {
  const [eventServicesList, setEventServiceList] = useState<ServiceType[]>([]);
  const [visible, setVisible] = useState(false);
  const [mashguiachModalVisible, setMashguiachModalVisible] = useState(false);
  const [selectService, setSelectService] = useState('');
  const [selectedMashguiach, setSelectedMashguiach] = useState<string | null>(null);

  const handleModalClick = () => {
    
    setVisible(!visible);
  };

  const handleMashguiachModalClick = (serviceId: string, mashguiachId?: string | null) => {
    setSelectService(serviceId);
    setMashguiachModalVisible(true);
    setSelectedMashguiach(mashguiachId ?? null); // Define o Mashguiach atual (ou null)
  };

  const fetchEventServices = async () => {
    const response = await getEventServices(eventStoreId);
    if (response) {
      setEventServiceList(response as ServiceType[]);
    }
  };

  useEffect(() => {
    if (eventStoreId) {
      fetchEventServices();
    }
  }, [eventStoreId]);

  const handleDeleteButton = async (id: string) => {
    if (confirm("Você tem certeza que deseja excluir esse evento?")) {
      await deleteEvent(id);
      fetchEventServices();
    }
  };

  return (
    <>
      <CCard textColor="primary" className={`mb-4 border-primary`} style={{ marginTop: "30px" }}>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Serviços de Mashguiach - Solicite um Mashguiach para cada dia</strong>
          <CButton color="primary" size="sm" onClick={handleModalClick}>
            Solicitar Serviço
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive="sm">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">Mashguiach</CTableHeaderCell>
                <CTableHeaderCell scope="col">Início</CTableHeaderCell>
                <CTableHeaderCell scope="col">Fim</CTableHeaderCell>
                <CTableHeaderCell scope="col">Preço</CTableHeaderCell>
                <CTableHeaderCell scope="col">Local</CTableHeaderCell>
                <CTableHeaderCell scope="col">Observação</CTableHeaderCell>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {eventServicesList.map((service, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>
                    {service.mashguiachId ? (
                      <span
                      style={{ color: "blue", cursor: "pointer" }}
                      onClick={() => handleMashguiachModalClick(service.id, service.mashguiachId)}
                    >
                      {service.Mashguiach.name}
                      </span>
                    ) : (
                      <span
                        style={{ color: "blue", cursor: "pointer" }}
                        onClick={() => handleMashguiachModalClick(service.id)}
                      >
                        S/M
                      </span>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <small>
                      {new Date(service.arriveMashguiachTime).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small>
                      {new Date(service.endMashguiachTime).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small>R$ {service.mashguiachPrice}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CTooltip
                      content={`${service.address_street}, ${service.address_number} - ${service.address_neighbor} - ${service.address_city} - ${service.address_state}`}
                    >
                      <CLink> {service.workType ?? ""} </CLink>
                    </CTooltip>
                  </CTableDataCell>
                  <CTableDataCell>
                    <small>{service.observationText}</small>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="danger"
                      onClick={() => handleDeleteButton(service.id)}
                    >
                      <CIcon icon={cilTrash} color="danger" />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
      <AddServiceToEventModal
        fetchAll={() => fetchEventServices()}
        StoreEventsId={eventStoreId}
        visible={visible}
        onClose={() => setVisible(false)}
      />
{mashguiachModalVisible && (
  <ChangeMashguiachModal
    onClose={() => {
      setMashguiachModalVisible(false);
      fetchEventServices(); // Atualiza a lista de serviços após o fechamento do modal
    }}
    serviceId={selectService}
    currentMashguiachId={selectedMashguiach} // Passa o Mashguiach atual
  />
)}    </>
  );
};

export default EventsTableByEvent;
