"use client"

import { useSession } from "next-auth/react";
import { cilBadge, cilCalendar, cilList, cilMoney, cilPlus, cilStar } from "@coreui/icons";
import MashguiachButtonGroup from "@/components/dashboard/MashguiachButtonGroupt";
import { CCol, CRow } from "@coreui/react-pro";

export default function MashguiachDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      {/* Agrupando os cards em um único CRow */}
      <CRow>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url='/stores' title="Meus Estabelecimentos" textColor="white" icon={cilBadge} color="primary" />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url='/estabelecimento/events' title="Meus Eventos" textColor="white" icon={cilCalendar} color="primary" />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url='/estabelecimento/events/create' title="Criar Novo Evento" textColor="white" icon={cilList} color="primary" />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url='/credits' title="Adicionar Crédito" textColor="white" icon={cilMoney} color="success" />
        </CCol>
        <CCol xs={12} sm={6} md={4}>
          <MashguiachButtonGroup url='/courses' title="Cursos" textColor="white" icon={cilStar} color="primary" />
        </CCol>
      </CRow>
    </div>
  );
}
