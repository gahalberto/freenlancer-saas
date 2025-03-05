import {
    CButton,
    CCol,
    CFormLabel,
    CFormSelect,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
} from "@coreui/react-pro";
import { EventsServices, User } from "@prisma/client";
import { useEffect, useState } from "react";
import { ChangeMashguiach } from "@/app/_actions/events/changeMashguiacht";
import { getAllMashguichim, getAvailableMashguichim } from "@/app/_actions/getAllMashguichim";
import { getEventServiceById } from "@/app/_actions/events/getEventServiceById";

interface ChangeMashguiachModalProps {
    onClose: () => void; // Propriedade para fechar o modal
    serviceId: string; // ID do serviço que será atualizado
    currentMashguiachId?: string | null; // ID do Mashguiach atual (pode ser nulo)
}

const ChangeMashguiachModal = ({
    onClose,
    serviceId,
    currentMashguiachId,
}: ChangeMashguiachModalProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const [mashguiachSelected, setMashguiachSelected] = useState<string | null>(
        currentMashguiachId ?? "999" // Se não houver Mashguiach, seleciona "ALEATÓRIO"
    );
    const [mashguiachOptions, setMashguiachOptions] = useState<User[]>([]);
    const [serviceDetails, setServiceDetails] = useState<EventsServices | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleClose = () => {
        setIsOpen(false);
        onClose(); // Notifica o componente pai que o modal foi fechado
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure the second argument is always a string
            const mashguiachId = mashguiachSelected === "999" ? "" : mashguiachSelected || "";
            await ChangeMashguiach(serviceId, mashguiachId);
            alert("Mashguiach atualizado com sucesso!");
            handleClose(); // Fecha o modal após a atualização
        } catch (error) {
            console.error("Erro ao atualizar Mashguiach:", error);
            alert("Erro ao atualizar Mashguiach!");
        }
    };

    // Buscar detalhes do serviço para obter os horários
    const fetchServiceDetails = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            console.log(`Buscando detalhes do serviço ID: ${serviceId}`);
            const service = await getEventServiceById(serviceId);
            if (service) {
                console.log(`Serviço encontrado:`, service);
                setServiceDetails(service);
            } else {
                console.error("Serviço não encontrado");
                setErrorMessage("Serviço não encontrado");
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes do serviço:", error);
            setErrorMessage("Erro ao buscar detalhes do serviço");
        } finally {
            setIsLoading(false);
        }
    };

    // Buscar mashguichim disponíveis com base nos horários do serviço
    const fetchMashguichim = async () => {
        try {
            setErrorMessage(null);
            if (!serviceDetails) {
                console.log("Sem detalhes do serviço, buscando todos os mashguichim");
                // Se não temos detalhes do serviço, buscamos todos os mashguichim
                const response = await getAllMashguichim();
                if (response) {
                    console.log(`Encontrados ${response.length} mashguichim no total`);
                    setMashguiachOptions(response);
                }
                return;
            }

            console.log(`Buscando mashguichim disponíveis para o período:`, {
                inicio: new Date(serviceDetails.arriveMashguiachTime).toLocaleString(),
                fim: new Date(serviceDetails.endMashguiachTime).toLocaleString()
            });

            // Se temos os horários, buscamos apenas os mashguichim disponíveis
            const availableMashguichim = await getAvailableMashguichim(
                new Date(serviceDetails.arriveMashguiachTime),
                new Date(serviceDetails.endMashguiachTime)
            );
            
            console.log(`Encontrados ${availableMashguichim.length} mashguichim disponíveis`);
            
            // Se o mashguiach atual não está na lista de disponíveis, mas é o atual do serviço,
            // devemos incluí-lo na lista para permitir manter a seleção
            if (currentMashguiachId && currentMashguiachId !== "999") {
                const currentMashguiachIsAvailable = availableMashguichim.some(
                    m => m.id === currentMashguiachId
                );
                
                console.log(`Mashguiach atual (${currentMashguiachId}) está disponível? ${currentMashguiachIsAvailable}`);
                
                if (!currentMashguiachIsAvailable) {
                    console.log(`Adicionando mashguiach atual à lista mesmo estando indisponível`);
                    // Buscar o mashguiach atual para adicionar à lista
                    const allMashguichim = await getAllMashguichim();
                    const currentMashguiach = allMashguichim.find(m => m.id === currentMashguiachId);
                    
                    if (currentMashguiach) {
                        console.log(`Mashguiach atual encontrado: ${currentMashguiach.name}`);
                        availableMashguichim.push(currentMashguiach);
                    } else {
                        console.log(`Mashguiach atual não encontrado na lista completa`);
                    }
                }
            }
            
            setMashguiachOptions(availableMashguichim);
        } catch (error) {
            console.error("Erro ao buscar mashguichim disponíveis:", error);
            setErrorMessage("Erro ao buscar mashguichim disponíveis");
            // Em caso de erro, carregamos todos os mashguichim
            const response = await getAllMashguichim();
            if (response) {
                setMashguiachOptions(response);
            }
        }
    };

    useEffect(() => {
        fetchServiceDetails();
    }, [serviceId]);

    useEffect(() => {
        if (!isLoading) {
            fetchMashguichim();
        }
    }, [serviceDetails, isLoading]);

    return (
        <CModal visible={isOpen} onClose={handleClose}>
            <CModalHeader closeButton>
                <CModalTitle>Alterar Mashguiach</CModalTitle>
            </CModalHeader>
            <CModalBody>
                {isLoading ? (
                    <p>Carregando...</p>
                ) : errorMessage ? (
                    <p style={{ color: 'red' }}>{errorMessage}</p>
                ) : (
                    <form onSubmit={handleUpdate}>
                        <CCol md={12}>
                            {serviceDetails && (
                                <div className="mb-3">
                                    <p><strong>Data do serviço:</strong> {new Date(serviceDetails.arriveMashguiachTime).toLocaleDateString()}</p>
                                    <p><strong>Horário:</strong> {new Date(serviceDetails.arriveMashguiachTime).toLocaleTimeString()} até {new Date(serviceDetails.endMashguiachTime).toLocaleTimeString()}</p>
                                </div>
                            )}
                            
                            <CFormLabel>Mashguiach:</CFormLabel>
                            <CFormSelect
                                value={mashguiachSelected ?? "999"} // Define o valor selecionado (padrão "ALEATÓRIO")
                                onChange={(e) => setMashguiachSelected(e.target.value === "999" ? null : e.target.value)}
                            >
                                <option value="999">ALEATÓRIO</option>
                                {mashguiachOptions.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </CFormSelect>
                            <CButton className="mt-4" color="primary" type="submit">
                                Atualizar
                            </CButton>
                        </CCol>
                    </form>
                )}
            </CModalBody>
        </CModal>
    );
};

export default ChangeMashguiachModal;