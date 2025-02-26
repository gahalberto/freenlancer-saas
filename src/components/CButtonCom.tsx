"use client"
import { CButton } from "@coreui/react-pro"
import Link from "next/link"

interface ButtonTypeProps {
    link: string,
    title: string
}

const ButtonCompo = ({ link, title }: ButtonTypeProps) => {
    return (
            <Link href={link}>
                <CButton color="secondary" size="sm">{title}</CButton>
            </Link>
    )
}

export default ButtonCompo;