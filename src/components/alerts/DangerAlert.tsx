'use client'
import { CAlert } from '@coreui/react-pro'
import Link from 'next/link'

const DangerAlert = () => {
  return (
    <CAlert color="danger">
      <b>OS TRABALHOS NÃO SERÃO LIBERADOS ATÉ QUE VOCÊ RESPONDA</b> O QUESTIONÁRIO DO MASHGUIACH!{' '}
      <Link href={'/app/questionario'}>CLIQUE AQUI PARA RESPONDER! </Link>
    </CAlert>
  )
}

export default DangerAlert
