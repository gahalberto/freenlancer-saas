"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormData } from "@/app/_schemas/userSchema";
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
} from "@coreui/react-pro";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserEditFormProps {
  initialData: UserFormData;
}

const UserEditForm = ({ initialData }: UserEditFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData,
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false); // Controla a exibição do toast

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      await fetch(`/api/estabelecimento/${initialData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

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
          <h5>Editar Usuário</h5>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Nome</CFormLabel>
                <CFormInput type="text" {...register("name")} invalid={!!errors.name} />
                {errors.name && <p className="text-danger">{errors.name.message}</p>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Email</CFormLabel>
                <CFormInput type="email" {...register("email")} invalid={!!errors.email} />
                {errors.email && <p className="text-danger">{errors.email.message}</p>}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Telefone</CFormLabel>
                <CFormInput type="text" {...register("phone")} invalid={!!errors.phone} />
                {errors.phone && <p className="text-danger">{errors.phone.message}</p>}
              </CCol>
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

export default UserEditForm;
