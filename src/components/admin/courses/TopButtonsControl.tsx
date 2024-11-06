"use client"
import { CButton } from "@coreui/react-pro";
import Link from "next/link";

const TopButtonsControl = () => {
    return (
        <>
            <Link href={`/admin/courses/create`}>
                <CButton color="primary">Criar Curso</CButton>
            </Link>
        </>
    )
}

export default TopButtonsControl;