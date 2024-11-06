"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { Course } from "@prisma/client"
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CFormTextarea, CRow } from "@coreui/react-pro";
import { updateCourseDetails } from "@/app/_actions/courses/updateCourseDetails";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageCourseUploud from "./ImageCourseUploud";

const schema = z.object({
    title: z.string().min(1, { message: "Digite um título para o curso" }),
    description: z.string().min(1, { message: "Digite uma descrição para o curso" }),
    instructor: z.string().min(1, { message: "Quem é o instrutor/rabino desse curso?" }),
});

type FormData = z.infer<typeof schema>;


interface CourseItemsProps {
    Course: Course
}

const CourseEditForm = ({ Course }: CourseItemsProps) => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (Course) {
            setValue("title", Course.title);
            setValue("description", Course.description);
            setValue("instructor", Course.instructor);
        }
    }, [Course, setValue]);

    const courseId = Course.id;

    const onSubmit = async (data: FormData) => {
        try {
            await updateCourseDetails({ data, courseId });
            router.push('/admin/courses')
        } catch (error) {
            console.error("Erro ao atualizar curso:", error);
        }
    }
    return (
        <>

            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <strong>Editar Curso</strong>
                            <Link href={`/admin/courses/create`}>
                                <CButton color="primary">Criar aula</CButton>
                            </Link>
                        </CCardHeader>
                        <CCardBody>
                            <CForm className="row g-3" onSubmit={handleSubmit(onSubmit)}>
                                <CCol md={12}>
                                    <CFormLabel>Título</CFormLabel>
                                    <CFormInput type="text" {...register("title")} invalid={!!errors.title} />
                                    {errors.title && <p className="text-danger">{errors.title.message}</p>}
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>Descrição</CFormLabel>
                                    <CFormTextarea rows={4} {...register("description")} invalid={!!errors.description}></CFormTextarea>
                                    {errors.description && <p className="text-danger">{errors.description.message}</p>}
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>Instrutor/Rabino</CFormLabel>
                                    <CFormInput type="text" {...register("instructor")} invalid={!!errors.instructor}></CFormInput>
                                    {errors.instructor && <p className="text-danger">{errors.instructor.message}</p>}
                                </CCol>

                                <CCol md={12}>
                                    <ImageCourseUploud courseId={Course.id} imageUrl={Course.imageUrl ? Course.imageUrl: ''} />
                                </CCol>

                                <CCol xs={12}>
                                    <CButton color="primary" type="submit">
                                        Atualizar
                                    </CButton>
                                </CCol>
                            </CForm>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

        </>
    )
}

export default CourseEditForm;