"use client"

import CIcon from "@coreui/icons-react"
import { CCard, CCardBody, CCardTitle, CCol, CRow } from "@coreui/react-pro"
import { cilList } from "@coreui/icons"
import Link from "next/link"

type PropsType = {
    title: string,
    icon: any,  // Tipo ajustado para aceitar o ícone importado
    color: string,
    textColor: string,
    url: string
}

export default function MashguiachButtonGroup(props: PropsType) {
    return (
        <Link href={props.url}>
            <CCard
                textBgColor={props.color}
                style={{ maxWidth: '18rem' }}
                className="mb-3 transition duration-300 hover:bg-blue-500 hover:text-white" // Classe Tailwind para mudar cor no hover
                textColor={props.textColor}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} // Efeito de zoom ao passar o mouse
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} // Remove o efeito ao retirar o mouse          
            >
                <CCardBody className="flex justify-center text-center items-center">
                    {/* Use o ícone corretamente */}
                    <CIcon className="flex justify-center text-center items-center mb-3" icon={props.icon} size="xxl" />
                    <CCardTitle>{props.title}</CCardTitle>
                </CCardBody>
            </CCard>
        </Link>

    )
}

