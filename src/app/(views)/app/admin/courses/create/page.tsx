"use client";

import { useSession, signIn } from "next-auth/react";
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CFormTextarea, CRow } from "@coreui/react-pro";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { postNewCourse } from "@/app/_actions/courses/postNewCourse";
import  Router, { useRouter } from "next/navigation";

const schema = z.object({
  title: z.string().min(1, { message: "Digite um título para o curso" }),
  description: z.string().min(1, { message: "Digite uma descrição para o curso" }),
  instructor: z.string().min(1, { message: "Quem é o instrutor/rabino desse curso? " }),
});

type FormData = z.infer<typeof schema>;

const CreateCourse = () => {
    const router = useRouter();
  const { data: session, status } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  if (!session) {
    return (
      <div>
        <p>Você precisa estar logado para criar um curso.</p>
        <CButton onClick={() => signIn()}>Logar</CButton>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    const completeData = {
      ...data,
      id: crypto.randomUUID(), // Gera um ID único
      imageUrl: null, // Considerando que você não está lidando com imagens aqui
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    const newCourse = await postNewCourse(completeData as any);
    if(newCourse) router.push('/admin/courses')
  };
  
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Criar novo curso</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <CCol md={12}>
                <CFormLabel>Título</CFormLabel>
                <CFormInput type="text" {...register("title")} invalid={!!errors.title} />
              </CCol>

              <CCol md={12}>
                <CFormLabel>Descrição</CFormLabel>
                <CFormTextarea rows={4} {...register("description")} invalid={!!errors.description}></CFormTextarea>
              </CCol>

              <CCol md={12}>
                <CFormLabel>Instrutor/Rabino</CFormLabel>
                <CFormInput type="text" {...register("instructor")} invalid={!!errors.instructor}></CFormInput>
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Criar
                </CButton>
                
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default CreateCourse;
