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
  CCardImage,
} from "@coreui/react-pro";
import { useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilBell, cilCloudUpload } from "@coreui/icons";

interface ModalCreateModulesProps {
  courseId: string;
  imageUrl: string;
}

export const ImageCourseUpload = ({ courseId, imageUrl }: ModalCreateModulesProps) => {
  const [visible, setVisible] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo válido.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile) {
      setError("A imagem é obrigatória.");
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('courseId', courseId);

    try {
      console.log("Enviando requisição para o backend..."); // Log de depuração
      const response = await fetch('/api/uploadImage', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error("Resposta não está OK:", response.status); // Log de depuração
        const errorData = await response.json();
        setError(errorData.error || "Erro ao enviar a imagem.");
        console.error("Erro ao enviar a imagem:", errorData.error);
      } else {
        console.log("Imagem enviada com sucesso!");
        setVisible(false);
        setImageFile(null);
      }
    } catch (error) {
      console.error("Erro ao enviar a imagem:", error); // Log de depuração
      setError("Erro ao enviar a imagem.");
    }
  };
  return (
    <>
      <CButton color="dark" onClick={() => setVisible(!visible)}>
        <CIcon icon={cilCloudUpload} className="me-2" />
        Imagem do Curso
      </CButton>

      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">Imagem de Capa do Curso</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            {imageUrl ? (
              <>
                <CFormLabel htmlFor="image" className="mt-3">Imagem Atual do curso: </CFormLabel>
                <CCardImage orientation="top" src={`${imageUrl}`} />
              </>
            ) : (
              <>
                <CFormLabel htmlFor="image" className="mt-3">Esse curso ainda não tem uma imagem de capa, envie a imagem abaixo se necessário </CFormLabel>
              </>
            )}
            <CFormInput
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              invalid={!!error}
            />
            {error && <p className="text-danger">{error}</p>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Fechar
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            Salvar mudanças
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default ImageCourseUpload;
