"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lesson } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    CButton,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CForm,
    CFormInput,
    CFormLabel,
} from "@coreui/react-pro";
import { updateLessonDetails } from "@/app/_actions/courses/updateLessonDetails";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const schema = z.object({
    title: z.string().min(1, { message: "Digite um título para o curso" }),
    contentUrl: z.string().nullable(), // Permite que seja null
    content: z.string().min(1, { message: "O conteúdo da aula é obrigatório" }),
});

type FormData = z.infer<typeof schema>;

interface LessonItemsProps {
    lesson: Lesson;
    isOpen: boolean;
    onClose: () => void;
    fetchLessons: () => void;
}

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const LessonEditModal = ({ lesson, isOpen, onClose, fetchLessons }: LessonItemsProps) => {
    const [visible, setVisible] = useState(isOpen);
    const [content, setContent] = useState(lesson?.textContent || "");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: lesson?.title || "",
            contentUrl: lesson?.contentUrl || "",
            content: lesson?.textContent || "", // Inicialize com uma string vazia se for undefined ou null
        },
    });
    
    const handleEditorChange = (value: string) => {
        setValue("content", value);
      };

      useEffect(() => {
        if (lesson) {
            setValue("title", lesson.title || ""); // Valor padrão vazio se for undefined
            setValue("contentUrl", lesson.contentUrl || null); // Valor padrão null se for undefined
            setContent(lesson.textContent || ""); // Usar textContent e inicializar com uma string vazia
        }
    }, [lesson, setValue]);
            
    const lessonId = lesson.id;

    const onSubmit = async (data: FormData) => {
        if (!content || content.trim() === "") {
            alert("O conteúdo da aula é obrigatório");
            return;
        }
    
        try {
            const updatedData = {
                data: {
                    title: data.title,
                    contentUrl: data.contentUrl,
                },
                textContent: content, // Passando o texto do editor
                lessonId: lesson.id,
            };
            
            await updateLessonDetails(updatedData);
            fetchLessons();
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar a aula:", error);
        }
    };
    
    
    
    
    useEffect(() => {
        setVisible(isOpen);
    }, [isOpen]);

    return (
        <CModal visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>Editar Curso</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit(onSubmit)}>
                <CModalBody>
                    <CFormLabel>Título</CFormLabel>
                    <CFormInput
                        type="text"
                        {...register("title")}
                        invalid={!!errors.title}
                    />
                    {errors.title && (
                        <p className="text-danger">{errors.title.message}</p>
                    )}

                    <CFormLabel>URL do Vídeo</CFormLabel>
                    <CFormInput
                        type="text"
                        {...register("contentUrl")}
                        invalid={!!errors.contentUrl}
                    />
                    {errors.contentUrl && (
                        <p className="text-danger">{errors.contentUrl.message}</p>
                    )}

                    <CFormLabel>Conteúdo da Aula</CFormLabel>
                    <ReactQuill value={content} onChange={setContent} />
                    {errors.content && (
                        <p className="text-danger">{errors.content.message}</p>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={onClose}>
                        Cancelar
                    </CButton>
                    <CButton color="primary" type="submit">
                        Atualizar
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    );
};

export default LessonEditModal;
