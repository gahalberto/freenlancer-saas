import { useEffect, useState } from "react";
import {
    CBadge,
    CButton,
    CCol,
    CDatePicker,
    CForm,
    CFormInput,
    CFormLabel,
    CFormTextarea,
    CInputGroup,
    CInputGroupText,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableRow
} from "@coreui/react-pro";
import { createEventServices } from "@/app/_actions/events/createEventServices";
import { useSession } from "next-auth/react";
import { getCreditsByUser } from "@/app/_actions/getCreditsByUser";
import { cilDollar } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PropsType = {
    visible: boolean;
    onClose: () => void;
    StoreEventsId: string; // ID do evento
    fetchAll: () => void;
};

const AddServiceToEventModal = ({ fetchAll, visible, onClose, StoreEventsId }: PropsType) => {
    const { data: session, status } = useSession();
    const [credits, setCredits] = useState(0);

    const fetchCredits = async () => {
        const response = await getCreditsByUser();
        if (response) {
            setCredits(response.credits);
        }
    }


    useEffect(() => {
        fetchCredits();
    }, [])

    const router = useRouter();


    const [arriveMashguiachTime, setArriveMashguiachTime] = useState<Date | null>(null);
    const [endMashguiachTime, setEndMashguiachTime] = useState<Date | null>(null);
    const [mashguiachPrice, setMashguiachPrice] = useState<number>(0); // Preço por hora
    const [totalPrice, setTotalPrice] = useState<number>(0); // Total calculado
    const [totalHours, setTotalHours] = useState<number>(0); // Total de horas trabalhadas
    const [observationText, setObservationText] = useState('');

    // Função para calcular as horas entre as datas
    const calculateHoursBetweenDates = (startDate: Date, endDate: Date) => {
        const differenceInMs = endDate.getTime() - startDate.getTime();
        const differenceInHours = differenceInMs / (1000 * 60 * 60); // Convertendo de milissegundos para horas
        return differenceInHours;
    };

    // Atualiza o cálculo sempre que uma data ou o preço mudarem
    useEffect(() => {
        if (arriveMashguiachTime && endMashguiachTime && mashguiachPrice > 0) {
            const hoursWorked = calculateHoursBetweenDates(arriveMashguiachTime, endMashguiachTime);
            setTotalHours(hoursWorked);
            setTotalPrice(hoursWorked * mashguiachPrice);
        }
    }, [arriveMashguiachTime, endMashguiachTime, mashguiachPrice]);

    const handleSubmit = async () => {
        if (!arriveMashguiachTime || !endMashguiachTime) {
            alert("Por favor, preencha todas as datas");
            return;
        }

        try {
            const response = await createEventServices({
                StoreEventsId,
                arriveMashguiachTime,
                endMashguiachTime,
                isApproved: false, // Valor inicial para isApproved
                //  mashguiachId,
                mashguiachPrice: totalPrice, // Enviando o preço total calculado
                mashguiachPricePerHour: mashguiachPrice,
                observationText
            });

            if (response) {
                alert("Formulário enviado com sucesso!");
                fetchAll();
                onClose(); // Fecha o modal após o envio
                fetchCredits();                
            } else {
                alert("Ocorreu um erro ao enviar o formulário.");
            }
        } catch (error) {
            console.error("Erro ao enviar formulário:", error);
            alert("Ocorreu um erro ao enviar o formulário.");
        }
    };

    return (
        <CModal visible={visible} onClose={onClose}>
            <CForm className="row g-3">
                <CModalHeader>
                    <CModalTitle>Solicitar Mashguiach</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CCol md={12}>
                        <CFormLabel>Data e Horário de <b>entrada</b> do Mashguiach:</CFormLabel>
                        <CDatePicker
                            timepicker
                            locale="pt-BR"
                            onDateChange={(date: Date | null) => {
                                if (date) {
                                    setArriveMashguiachTime(date);
                                }
                            }}
                        />
                    </CCol>

                    <CCol md={12} style={{ marginTop: '18px' }}>
                        <CFormLabel>Data e Horário de <b>saída</b> do Mashguiach:</CFormLabel>
                        <CDatePicker
                            timepicker
                            locale="pt-BR"
                            onDateChange={(date: Date | null) => {
                                if (date) {
                                    setEndMashguiachTime(date);
                                }
                            }}
                        />
                    </CCol>

                    <CCol md={12} style={{ marginTop: '18px' }}>
                        <CFormLabel>Preço por hora do Mashguiach</CFormLabel>
                        <CInputGroup className="mb-3">
                            <CInputGroupText>R$</CInputGroupText>
                            <CFormInput
                                type="number"
                                aria-label="Valor em reais"
                                value={mashguiachPrice}
                                onChange={(e) => setMashguiachPrice(Number(e.target.value))} // Atualiza o preço
                            />
                        </CInputGroup>
                    </CCol>
                    <CCol md={12}>
                        <CFormLabel>Observação:</CFormLabel>
                        <CFormTextarea
                            value={observationText}
                            onChange={(e) => setObservationText(e.target.value)} // Atualiza o preço
                        >

                        </CFormTextarea>
                    </CCol>
                    <CCol style={{ marginTop: '18px' }}>
                        <CCol lg={4} sm={5} className="ms-auto">
                            <CTable>
                                <CTableBody>
                                    <CTableRow>
                                        <CTableDataCell className="text-start">
                                            <strong>Total de Horas:</strong>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end">{totalHours.toFixed(2)}</CTableDataCell>
                                    </CTableRow>
                                    <CTableRow>
                                        <CTableDataCell className="text-start">
                                            <strong>Preço da hora do Mashguiach: </strong>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end">R$ {mashguiachPrice.toFixed(2)}</CTableDataCell>
                                    </CTableRow>
                                    <CTableRow>
                                        <CTableDataCell className="text-start">
                                            <strong>Total a pagar: </strong>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end">R$ {totalPrice.toFixed(2)}</CTableDataCell>
                                    </CTableRow>
                                    <CTableRow>
                                        <CTableDataCell className="text-start">
                                            <strong>Sua carteira:</strong>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end">
                                            {totalPrice > credits ? (
                                                <CBadge color="danger">R$ {credits}</CBadge>
                                            ) : (
                                                <CBadge color="primary">R$ {credits}</CBadge>
                                            )}
                                        </CTableDataCell>
                                    </CTableRow>
                                </CTableBody>
                            </CTable>
                        </CCol>
                    </CCol>
                </CModalBody>
                <CModalFooter>
                    {(totalPrice > credits ? (
                        <Link href={`/credits`}>
                            <CButton color="danger" size="sm">
                                <CIcon icon={cilDollar} /> Você não tem crédito suficiente, adicione créditos
                            </CButton>
                        </Link>
                    ) : (
                        <CButton color="success" onClick={handleSubmit}>Pagar & Solicitar Mashguiach</CButton>
                    ))}
                    <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    );
};

export default AddServiceToEventModal;
