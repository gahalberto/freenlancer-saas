import {
    CButton,
    CCol,
    CFormInput,
    CFormLabel,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CAlert
} from "@coreui/react-pro";
import { EventsServices } from "@prisma/client";
import { useEffect, useState } from "react";
import { updateEventDates } from "@/app/_actions/events/updateEventDates";
import { getEventServiceById } from "@/app/_actions/events/getEventServiceById";
import { format } from "date-fns";

interface EditDatesModalProps {
    onClose: () => void;
    serviceId: string;
    canEdit: boolean; // Indica se o usuário pode editar as datas
}

const EditDatesModal = ({
    onClose,
    serviceId,
    canEdit
}: EditDatesModalProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const [serviceDetails, setServiceDetails] = useState<EventsServices | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleClose = () => {
        setIsOpen(false);
        onClose();
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!canEdit) {
            setErrorMessage("Você não tem permissão para editar as datas deste serviço.");
            return;
        }

        try {
            setErrorMessage(null);
            setSuccessMessage(null);
            
            // Combinar data e hora para criar objetos Date
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);
            
            // Verificar se as datas são válidas
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                setErrorMessage("Datas ou horários inválidos.");
                return;
            }
            
            // Verificar se a data de início é anterior à data de fim
            if (startDateTime >= endDateTime) {
                setErrorMessage("A data/hora de início deve ser anterior à data/hora de fim.");
                return;
            }
            
            await updateEventDates(serviceId, startDateTime, endDateTime);
            setSuccessMessage("Datas atualizadas com sucesso!");
            
            // Atualizar os detalhes do serviço após a atualização
            await fetchServiceDetails();
            
            // Opcional: fechar o modal após alguns segundos
            setTimeout(() => {
                handleClose();
            }, 2000);
            
        } catch (error) {
            console.error("Erro ao atualizar datas:", error);
            setErrorMessage("Erro ao atualizar datas. Tente novamente.");
        }
    };

    const fetchServiceDetails = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            
            const service = await getEventServiceById(serviceId);
            if (service) {
                setServiceDetails(service);
                
                // Formatar datas para os inputs
                const arriveDate = new Date(service.arriveMashguiachTime);
                const endDate = new Date(service.endMashguiachTime);
                
                setStartDate(format(arriveDate, "yyyy-MM-dd"));
                setStartTime(format(arriveDate, "HH:mm"));
                setEndDate(format(endDate, "yyyy-MM-dd"));
                setEndTime(format(endDate, "HH:mm"));
            } else {
                setErrorMessage("Serviço não encontrado");
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes do serviço:", error);
            setErrorMessage("Erro ao buscar detalhes do serviço");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceDetails();
    }, [serviceId]);

    return (
        <CModal visible={isOpen} onClose={handleClose}>
            <CModalHeader closeButton>
                <CModalTitle>Editar Datas do Serviço</CModalTitle>
            </CModalHeader>
            <CModalBody>
                {isLoading ? (
                    <p>Carregando...</p>
                ) : errorMessage ? (
                    <CAlert color="danger">{errorMessage}</CAlert>
                ) : (
                    <form onSubmit={handleUpdate}>
                        {successMessage && (
                            <CAlert color="success">{successMessage}</CAlert>
                        )}
                        
                        {!canEdit && (
                            <CAlert color="warning">
                                Você não tem permissão para editar as datas deste serviço.
                                Apenas administradores podem editar serviços com Mashguiach atribuído.
                            </CAlert>
                        )}
                        
                        <CCol md={12} className="mb-3">
                            <CFormLabel>Data de Início:</CFormLabel>
                            <CFormInput
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={!canEdit}
                            />
                        </CCol>
                        
                        <CCol md={12} className="mb-3">
                            <CFormLabel>Horário de Início:</CFormLabel>
                            <CFormInput
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                disabled={!canEdit}
                            />
                        </CCol>
                        
                        <CCol md={12} className="mb-3">
                            <CFormLabel>Data de Término:</CFormLabel>
                            <CFormInput
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={!canEdit}
                            />
                        </CCol>
                        
                        <CCol md={12} className="mb-3">
                            <CFormLabel>Horário de Término:</CFormLabel>
                            <CFormInput
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                disabled={!canEdit}
                            />
                        </CCol>
                        
                        <CButton 
                            className="mt-3" 
                            color="primary" 
                            type="submit"
                            disabled={!canEdit}
                        >
                            Atualizar Datas
                        </CButton>
                    </form>
                )}
            </CModalBody>
        </CModal>
    );
};

export default EditDatesModal; 