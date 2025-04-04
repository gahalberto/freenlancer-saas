import {
    CButton,
    CCol,
    CFormInput,
    CFormLabel,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CAlert,
    CInputGroup,
    CInputGroupText,
    CRow,
    CAccordion,
    CAccordionItem,
    CAccordionHeader,
    CAccordionBody
} from "@coreui/react-pro";
import { EventsServices } from "@prisma/client";
import { useEffect, useState } from "react";
import { updateEventDates } from "@/app/_actions/events/updateEventDates";
import { getEventServiceById } from "@/app/_actions/events/getEventServiceById";
import { format } from "date-fns";
import PriceCalculationInfo from "./PriceCalculationInfo";

// Estendendo o tipo EventsServices para incluir os novos campos
interface ExtendedEventsServices extends Omit<EventsServices, 'dayHourValue' | 'nightHourValue'> {
    dayHourValue: number;
    nightHourValue: number;
}

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
    const [serviceDetails, setServiceDetails] = useState<ExtendedEventsServices | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [dayHourValue, setDayHourValue] = useState<number>(50);
    const [nightHourValue, setNightHourValue] = useState<number>(75);
    const [transport_price, setTransport_price] = useState<number>(0);
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
            
            
            // Verificar se os valores de hora são válidos
            if (dayHourValue <= 0 || nightHourValue <= 0) {
                setErrorMessage("Os valores de hora devem ser maiores que zero.");
                return;
            }
            
            // Verificar se o valor do transporte é válido
            if (transport_price < 0) {
                setErrorMessage("O valor do transporte não pode ser negativo.");
                return;
            }
            
            // Calcular o preço estimado para atualizar o mashguiachPrice
            const priceEstimateResult = calculateEstimatedPrice();
            const totalPrice = (priceEstimateResult?.totalValue || 0) + transport_price;
            
            // Adicionar o preço total ao atualizar o serviço
            await updateEventDates(
                serviceId, 
                startDateTime, 
                endDateTime, 
                dayHourValue, 
                nightHourValue,
                totalPrice,
                transport_price
            );
            
            setSuccessMessage("Serviço atualizado com sucesso!");
            
            // Atualizar os detalhes do serviço após a atualização
            await fetchServiceDetails();
            
            // Opcional: fechar o modal após alguns segundos
            setTimeout(() => {
                handleClose();
            }, 2000);
            
        } catch (error) {
            console.error("Erro ao atualizar serviço:", error);
            setErrorMessage("Erro ao atualizar serviço. Tente novamente.");
        }
    };

    const fetchServiceDetails = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            
            const service = await getEventServiceById(serviceId);
            if (service) {
                // Cast para o tipo estendido
                const extendedService = service as ExtendedEventsServices;
                setServiceDetails(extendedService);
                
                // Formatar datas para os inputs
                const arriveDate = new Date(service.arriveMashguiachTime);
                const endDate = new Date(service.endMashguiachTime);
                
                setStartDate(format(arriveDate, "yyyy-MM-dd"));
                setStartTime(format(arriveDate, "HH:mm"));
                setEndDate(format(endDate, "yyyy-MM-dd"));
                setEndTime(format(endDate, "HH:mm"));
                
                // Definir valores de hora
                setDayHourValue(extendedService.dayHourValue || 50);
                setNightHourValue(extendedService.nightHourValue || 75);
                setTransport_price(service.transport_price || 0);
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

    // Definir o tipo de retorno da função calculateEstimatedPrice
    interface PriceEstimate {
        dayHours: number;
        nightHours: number;
        dayValue: number;
        nightValue: number;
        totalValue: number;
    }

    // Calcular o preço estimado com base nas datas e valores de hora
    const calculateEstimatedPrice = (): PriceEstimate | null => {
        if (!startDate || !startTime || !endDate || !endTime) {
            return null;
        }

        try {
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);
            
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime()) || startDateTime >= endDateTime) {
                return null;
            }
            
            console.log("Calculando preço para:", {
                startDateTime: startDateTime.toLocaleString(),
                endDateTime: endDateTime.toLocaleString(),
                dayHourValue,
                nightHourValue
            });
            
            // Calcular duração total em horas
            const durationMs = endDateTime.getTime() - startDateTime.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);
            
            // Calcular horas diurnas e noturnas
            let dayHours = 0;
            let nightHours = 0;
            
            // Criar cópia da data de início para iterar
            const currentTime = new Date(startDateTime);
            
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
                if (currentTime > endDateTime) {
                    const overflowMs = currentTime.getTime() - endDateTime.getTime();
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
            
            console.log("Horas calculadas:", {
                dayHours,
                nightHours,
                total: dayHours + nightHours,
                durationHours
            });
            
            // Calcular preço total
            const dayValue = dayHours * dayHourValue;
            const nightValue = nightHours * nightHourValue;
            const totalValue = dayValue + nightValue;
            
            return {
                dayHours: Math.max(0, dayHours),
                nightHours: Math.max(0, nightHours),
                dayValue,
                nightValue,
                totalValue
            };
        } catch (error) {
            console.error("Erro ao calcular preço estimado:", error);
            return null;
        }
    };

    const priceEstimate = calculateEstimatedPrice();

    return (
        <CModal visible={isOpen} onClose={handleClose} size="lg">
            <CModalHeader closeButton>
                <CModalTitle>Editar Serviço</CModalTitle>
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
                                Você não tem permissão para editar este serviço.
                                Apenas administradores podem editar serviços com Mashguiach atribuído.
                            </CAlert>
                        )}
                        
                        <CRow>
                            <CCol md={6} className="mb-3">
                                <CFormLabel>Data de Início:</CFormLabel>
                                <CFormInput
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={!canEdit}
                                />
                            </CCol>
                            
                            <CCol md={6} className="mb-3">
                                <CFormLabel>Horário de Início:</CFormLabel>
                                <CFormInput
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    disabled={!canEdit}
                                />
                            </CCol>
                        </CRow>
                        
                        <CRow>
                            <CCol md={6} className="mb-3">
                                <CFormLabel>Data de Término:</CFormLabel>
                                <CFormInput
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={!canEdit}
                                />
                            </CCol>
                            
                            <CCol md={6} className="mb-3">
                                <CFormLabel>Horário de Término:</CFormLabel>
                                <CFormInput
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    disabled={!canEdit}
                                />
                            </CCol>
                        </CRow>
                        
                        <CRow className="mt-4">
                            <CCol md={4} className="mb-3">
                                <CFormLabel>Valor da hora diurna (6h-22h):</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText>R$</CInputGroupText>
                                    <CFormInput
                                        type="number"
                                        value={dayHourValue}
                                        onChange={(e) => setDayHourValue(Number(e.target.value))}
                                        disabled={!canEdit}
                                        min="1"
                                        step="0.01"
                                    />
                                </CInputGroup>
                            </CCol>
                            
                            <CCol md={4} className="mb-3">
                                <CFormLabel>Valor da hora noturna (22h-6h):</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText>R$</CInputGroupText>
                                    <CFormInput
                                        type="number"
                                        value={nightHourValue}
                                        onChange={(e) => setNightHourValue(Number(e.target.value))}
                                        disabled={!canEdit}
                                        min="1"
                                        step="0.01"
                                    />
                                </CInputGroup>
                            </CCol>
                            
                            <CCol md={4} className="mb-3">
                                <CFormLabel>Valor do transporte:</CFormLabel>
                                <CInputGroup>
                                    <CInputGroupText>R$</CInputGroupText>
                                    <CFormInput
                                        type="number"
                                        value={transport_price}
                                        onChange={(e) => setTransport_price(Number(e.target.value))}
                                        disabled={!canEdit}
                                        min="0"
                                        step="0.01"
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>
                        
                        {priceEstimate && (
                            <CAlert color="info" className="mt-3">
                                <h5>Estimativa de preço:</h5>
                                <p>Horas diurnas: {priceEstimate?.dayHours.toFixed(2)} ({priceEstimate?.dayValue.toFixed(2)} R$)</p>
                                <p>Horas noturnas: {priceEstimate?.nightHours.toFixed(2)} ({priceEstimate?.nightValue.toFixed(2)} R$)</p>
                                <p>Transporte: {transport_price.toFixed(2)} R$</p>
                                <p><strong>Total estimado: {(priceEstimate?.totalValue + transport_price).toFixed(2)} R$</strong></p>
                            </CAlert>
                        )}
                        
                        <CAccordion className="mt-4 mb-4">
                            <CAccordionItem>
                                <CAccordionHeader>Informações sobre o cálculo de preços</CAccordionHeader>
                                <CAccordionBody>
                                    <PriceCalculationInfo 
                                        dayHourValue={dayHourValue} 
                                        nightHourValue={nightHourValue} 
                                    />
                                </CAccordionBody>
                            </CAccordionItem>
                        </CAccordion>
                        
                        <CButton 
                            className="mt-3" 
                            color="primary" 
                            type="submit"
                            disabled={!canEdit}
                        >
                            Atualizar Serviço
                        </CButton>
                    </form>
                )}
            </CModalBody>
        </CModal>
    );
};

export default EditDatesModal; 