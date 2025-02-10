"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserFormData } from "@/app/_schemas/userSchema";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
  CInputGroup,
  CInputGroupText,
} from "@coreui/react-pro";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked } from "@coreui/icons";
import { z } from "zod";
import { ChangeUserPassword } from "@/app/_actions/admin/changeUserPassword";

interface UserEditFormProps {
  initialData: UserFormData;
}

const userPasswordSchema = z.object({
    password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
    confirmPassword: z.string().min(6, { message: 'Confirmação de senha é obrigatória' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'], // Caminho para o campo que está com erro
  })

  type UserPasswordSchema = z.infer<typeof userPasswordSchema>

const NewPasswordForm = ({ initialData }: UserEditFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserPasswordSchema>({
    resolver: zodResolver(userPasswordSchema)
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false); // Controla a exibição do toast

  const onSubmit = async (data: UserPasswordSchema) => {
    setLoading(true);
    try {
        setLoading(true);
        const newPassword = await ChangeUserPassword(initialData.id, data.password)
        if(newPassword){
            setToastVisible(true); // Mostra o toast após o sucesso
    
        }
          setTimeout(() => setToastVisible(false), 3000); // Esconde o toast após 3 segundos

          setToastVisible(true); // Mostra o toast após o sucesso
      setTimeout(() => setToastVisible(false), 3000); // Esconde o toast após 3 segundos
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CCard>
        <CCardHeader>
          <h5>Nova senha</h5>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <CRow className="mb-3">
            {errors.password && <span className="text-danger">{errors.password.message}</span>}
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon icon={cilLockLocked} />
          </CInputGroupText>
          <CFormInput
            type="password"
            placeholder="Senha"
            autoComplete="new-password"
            {...register('password')}
          />
        </CInputGroup>

        {errors.confirmPassword && (
          <span className="text-danger">{errors.confirmPassword.message}</span>
        )}

        <CInputGroup className="mb-4">
          <CInputGroupText>
            <CIcon icon={cilLockLocked} />
          </CInputGroupText>
          <CFormInput
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </CInputGroup>
            </CRow>
            <CButton type="submit" color="primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>

      {/* Renderiza o toast condicionalmente */}
      {toastVisible && (
    <CToaster className="position-static">
          <CToast animation autohide visible>
            <CToastHeader closeButton>
              <svg
                className="rounded me-2"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
                role="img"
              >
                <rect width="100%" height="100%" fill="#007aff"></rect>
              </svg>
              <div className="fw-bold me-auto">Sucesso!</div>
              <small>Agora</small>
            </CToastHeader>
            <CToastBody>Usuário atualizado com sucesso!</CToastBody>
          </CToast>
        </CToaster>
      )}
    </>
  );
};

export default NewPasswordForm;
