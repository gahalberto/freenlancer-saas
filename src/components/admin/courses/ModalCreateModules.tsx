import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CForm, CFormInput, CFormLabel } from "@coreui/react-pro";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createModule } from "@/app/_actions/courses/createModule";

// Esquema de validação para o formulário de criação de módulo
const schema = z.object({
  title: z.string().min(1, { message: "O título do módulo é obrigatório" }),
});

type FormData = z.infer<typeof schema>;

interface ModalCreateModulesProps {
  courseId: string;  // Adiciona courseId como uma prop obrigatória
  fetchModules: () => void;
}

export const ModalCreateModules = ({ courseId, fetchModules }: ModalCreateModulesProps) => {
  const [visible, setVisible] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const moduleData = { ...data, courseId };  // Inclui o courseId nos dados a serem enviados
      await createModule(moduleData);
      setVisible(false);
      reset();
      fetchModules();
    } catch (error) {
      console.error("Erro ao criar módulo:", error);
    }
  };

  return (
    <>
      <CButton color="primary" onClick={() => setVisible(!visible)}>Criar Módulo</CButton>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">Criar Módulo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <CFormLabel htmlFor="title">Título do Módulo</CFormLabel>
            <CFormInput
              id="title"
              type="text"
              {...register("title")}
              invalid={!!errors.title}
            />
            {errors.title && <p className="text-danger">{errors.title.message}</p>}
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

export default ModalCreateModules;
