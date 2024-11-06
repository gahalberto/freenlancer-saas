"use client"
import { CAlert } from "@coreui/react-pro"
import Link from "next/link"

interface AlertProps {
    msg: string
}

const DangerAlert = ({msg}: AlertProps) => {

    return(
        <CAlert color="warning">{msg} <Link href={'/questionario'}>Responda aqui </Link></CAlert>
    )
}

export default DangerAlert;