'use client'
import { createType } from '@/app/_actions/stores/createType'
import {
  CButton,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react-pro'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const typeSchema = z.object({
  title: z.string().min(1, { message: 'Digite um título para o tipo de estabelecimento' }),
})

type FormData = z.infer<typeof typeSchema>

type Props = {
  onClose: () => void
}

const StoreTypeModalForm = ({ onClose }: Props) => {
  const [visible, setVisible] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(typeSchema),
  })

  const onSubmit = async (data: FormData) => {
    const completeData = {
      ...data,
    }

    const newType = await createType(data.title)

    if (newType) {
      alert('Tipo de estabelecimento criado com sucesso')
      onClose()
    }

    // Fechar o modal após o envio com sucesso
    setVisible(false)
    reset()
  }

  const closeModal = () => {
    reset()
    setVisible(false)
  }

  return (
    <>
      <CButton color="primary" size="sm" onClick={() => setVisible(true)}>
        Adicionar
      </CButton>
      <CModal visible={visible} onClose={closeModal} aria-labelledby="LiveDemoExampleLabel">
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Adicionar Tipo de Estabelecimento</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm className="row g-3" onSubmit={handleSubmit(onSubmit)}>
            <CFormInput
              type="text"
              label="Título do novo tipo de estabelecimento"
              placeholder="Restaurante..."
              text="Verifique se esse tipo de estabelecimento já não existe"
              aria-describedby="exampleFormControlInputHelpInline"
              invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title && <div className="text-danger">{errors.title.message}</div>}
            <CButton color="primary" type="submit">
              Adicionar
            </CButton>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default StoreTypeModalForm
