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
                <CButton color="primary">{title}</CButton>
            </Link>
    )
}

export default ButtonCompo;