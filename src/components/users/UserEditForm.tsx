"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormData } from "@/app/_schemas/userSchema";
import { CCard, CCardBody, CCardHeader, CForm, CFormInput, CFormLabel, CButton, CRow, CCol } from "@coreui/react-pro";
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

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      await fetch(`/api/users/${initialData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      router.push("/users");
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <CCol md={6}>
              <CFormLabel>Endereço</CFormLabel>
              <CFormInput type="text" {...register("address")} invalid={!!errors.address} />
              {errors.address && <p className="text-danger">{errors.address.message}</p>}
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Nome Judaico</CFormLabel>
              <CFormInput type="text" {...register("jewishName")} invalid={!!errors.jewishName} />
              {errors.jewishName && <p className="text-danger">{errors.jewishName.message}</p>}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Status</CFormLabel>
              <CFormInput type="checkbox" {...register("status")} defaultChecked={initialData.status} />
              {errors.status && <p className="text-danger">{errors.status.message}</p>}
            </CCol>
          </CRow>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default UserEditForm;
