'use client'

import {
    CButton,
    CCard,
    CCardHeader,
    CCardBody,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilDollar, cilPrint, cilSave } from '@coreui/icons'
import { useEffect, useState } from 'react'
import { EventsServices } from '@prisma/client'
import { getServiceById } from '@/app/_actions/services/getServiceById'

type PropsType = {
    params: {
        id: string
    }
}

import { EventsServicesWithStoreEvents } from '@/app/_actions/services/getServiceById'


const Invoice = ({ params }: PropsType) => {
    // Estado inicial ajustado para armazenar um único objeto ou null
    const [service, setService] = useState<EventsServicesWithStoreEvents | null>(null);

    // Busca o serviço por ID
    const fetchServices = async () => {
        const serviceData = await getServiceById(params.id);
        if (serviceData) {
            setService(serviceData); // Agora, setamos diretamente o objeto
        }
    };

    useEffect(() => {
        fetchServices();
    }, [params.id]);

    const print = (e: any) => {
        e.preventDefault();
        window.print();
    };

    return (
        <CCard>
            <CCardHeader>
                Invoice <strong>{service?.StoreEvents?.title || "N/A"}</strong> {/* Verifica se o serviço está carregado */}
                <CButton
                    className="me-1 float-end"
                    size="sm"
                    color="secondary"
                    onClick={print}
                >
                    <CIcon icon={cilPrint} /> Imprimir
                </CButton>
                <CButton className="me-1 float-end" size="sm" color="info">
                    <CIcon icon={cilSave} /> Salvar
                </CButton>
            </CCardHeader>
            <CCardBody>
                <CRow className="mb-4">
                    <CCol sm={4}>
                        <h6 className="mb-3">Do:</h6>
                        <div>
                            <strong>{service?.StoreEvents?.title || "N/A"}</strong>
                        </div>
                        <div>{service?.StoreEvents?.address || "Endereço não informado"}</div>
                        <strong>Cliente:</strong> {service?.StoreEvents?.clientName || "Cliente não informado"}
                    </CCol>
                    <CCol sm={4}>
                        <h6 className="mb-3">Para:</h6>
                        <div>
                            <strong>Mashguiach: {service?.Mashguiach?.name || "Cliente não informado"}</strong>
                        </div>
                        <div>{service?.StoreEvents?.address || "Endereço do cliente não informado"}</div>
                    </CCol>
                    <CCol sm={4}>
                        <h6 className="mb-3">Detalhes:</h6>
                        <div>
                            Invoice <strong>#{service?.id}</strong>
                        </div>
                        <div>{new Date().toLocaleDateString()}</div>
                    </CCol>
                </CRow>

                {/* Exibição dos serviços relacionados */}
                <CTable striped>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell className="text-center">#</CTableHeaderCell>
                            <CTableHeaderCell>Item</CTableHeaderCell>
                            <CTableHeaderCell>Descrição</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Quantidade</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Custo Unit:</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        <CTableRow>
                            <CTableDataCell className="text-start">1</CTableDataCell>
                            <CTableDataCell className="text-center">Serviço de Mashguiach</CTableDataCell>
                            <CTableDataCell className="text-start">{service?.observationText}</CTableDataCell>
                            <CTableDataCell className="text-center">1</CTableDataCell>
                            <CTableDataCell className="text-end">R$ {service?.mashguiachPrice?.toFixed(2)}</CTableDataCell>
                            <CTableDataCell className="text-end">R$ {service?.mashguiachPrice?.toFixed(2)}</CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>

                <CRow>
                    <CCol lg={4} sm={5}>
                        Informações adicionais...
                    </CCol>
                    <CCol lg={4} sm={5} className="ms-auto">
                        <CTable>
                            <CTableBody>
                                <CTableRow>
                                    <CTableDataCell className="text-start">
                                        <strong>Subtotal</strong>
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end">R$ {service?.mashguiachPrice.toFixed(2)}</CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableDataCell className="text-start">
                                        <strong>Taxa de Serviço (2.16%)</strong>
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end">R$ {service?.mashguiachPrice ? ((service?.mashguiachPrice) * 0.0216).toFixed(2) : ''}</CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableDataCell className="text-start">
                                        <strong>Total</strong>
                                    </CTableDataCell>
                                    {service?.mashguiachPrice && (
                                        <CTableDataCell className="text-end">
                                            <strong>R$ {((service?.mashguiachPrice as number) - (service.mashguiachPrice * 0.0216)).toFixed(2)}</strong>
                                        </CTableDataCell>
                                    )}
                                </CTableRow>
                            </CTableBody>
                        </CTable>
                        <CButton color="success">
                            <CIcon icon={cilDollar} /> Pedir deposito
                        </CButton>
                    </CCol>
                </CRow>
            </CCardBody>
        </CCard>
    );
};

export default Invoice;
