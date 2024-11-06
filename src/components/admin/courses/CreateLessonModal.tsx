import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CForm, CFormInput, CFormLabel } from "@coreui/react-pro";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { createLesson } from "@/app/_actions/courses/createLesson";

// Esquema de validação para o formulário de criação de aula
const schema = z.object({
  title: z.string().min(1, { message: "O título da aula é obrigatório" }),
  contentUrl: z.string().url({ message: "A URL do conteúdo deve ser válida" }).optional(),
  textContent: z.string().min(1, { message: "O conteúdo da aula é obrigatório" }),
});

type FormData = z.infer<typeof schema>;

interface CreateLessonModalProps {
  courseId: string;
  moduleId: string;
  fetchModules: () => void;
}

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export const CreateLessonModal = ({courseId, moduleId, fetchModules }: CreateLessonModalProps) => {
  const [visible, setVisible] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Registrar manualmente o campo "content" para o formulário
  const handleEditorChange = (value: string) => {
    setValue("textContent", value);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const lessonData = { ...data, courseId, moduleId };
      await createLesson(lessonData);
      setVisible(false);
      reset();
      fetchModules();
    } catch (error) {
      console.error("Erro ao criar aula:", error);
    }
  };

  return (
    <>
      <CButton size="sm" className="mx-2" color="secondary" variant="outline" onClick={() => setVisible(!visible)}>Criar Aula</CButton>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">Criar Aula</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <CFormLabel htmlFor="title">Título da Aula</CFormLabel>
            <CFormInput
              id="title"
              type="text"
              {...register("title")}
              invalid={!!errors.title}
            />
            {errors.title && <p className="text-danger">{errors.title.message}</p>}

            <CFormLabel htmlFor="contentUrl" className="mt-3">URL do Conteúdo</CFormLabel>
            <CFormInput
              id="contentUrl"
              type="url"
              placeholder="https://exemplo.com/conteudo"
              {...register("contentUrl")}
              invalid={!!errors.contentUrl}
            />
            {errors.contentUrl && <p className="text-danger">{errors.contentUrl.message}</p>}

            <CFormLabel className="mt-3">Conteúdo da Aula</CFormLabel>
            <ReactQuill onChange={handleEditorChange} />
            {errors.textContent && <p className="text-danger">{errors.textContent.message}</p>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Fechar
          </CButton>
          <CButton color="primary" onClick={handleSubmit(onSubmit)}>
            Salvar mudanças
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default CreateLessonModal;
