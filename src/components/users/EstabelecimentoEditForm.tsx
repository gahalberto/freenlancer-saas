"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { esatebelcimentoSchema, EstabelecimentoFormData } from "@/app/_schemas/estabelecimentoSchema";

interface UserEditFormProps {
  initialData: {
    id?: string;
    title?: string;
  };
}

const EstabelecimentoEditForm = ({ initialData }: UserEditFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<EstabelecimentoFormData>({
    resolver: zodResolver(esatebelcimentoSchema),
    defaultValues: {
      id: initialData.id,
      title: initialData.title,
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const onSubmit = async (data: EstabelecimentoFormData) => {
    setLoading(true);
    try {
      await fetch(`/api/estabelecimento/${initialData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
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
          <h5>Editar Estabelecimento</h5>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Nome</CFormLabel>
                <CFormInput type="text" {...register("title")} invalid={!!errors.title} />
                {errors.title && <p className="text-danger">{errors.title.message}</p>}
              </CCol>
            </CRow>
            <CButton type="submit" color="primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>

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
            <CToastBody>Estabelecimento atualizado com sucesso!</CToastBody>
          </CToast>
        </CToaster>
      )}
    </>
  );
};

export default EstabelecimentoEditForm;
