import {
    CButton,
    CCol,
    CFormLabel,
    CFormSelect,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
  } from "@coreui/react-pro";
  import { User } from "@prisma/client";
  import { useEffect, useState } from "react";
  import { ChangeMashguiach } from "@/app/_actions/events/changeMashguiacht";
  import { getAllMashguichim } from "@/app/_actions/getAllMashguichim";
  
  interface ChangeMashguiachModalProps {
    onClose: () => void; // Propriedade para fechar o modal
    serviceId: string; // ID do serviço que será atualizado
    currentMashguiachId?: string | null; // ID do Mashguiach atual (pode ser nulo)
  }
  
  const ChangeMashguiachModal = ({
    onClose,
    serviceId,
    currentMashguiachId,
  }: ChangeMashguiachModalProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const [mashguiachSelected, setMashguiachSelected] = useState<string>(
      currentMashguiachId ?? "999" // Se não houver Mashguiach, seleciona "ALEATÓRIO"
    );
    const [mashguiachOptions, setMashguiachOptions] = useState<User[]>([]);
  
    const handleClose = () => {
      setIsOpen(false);
      onClose(); // Notifica o componente pai que o modal foi fechado
    };
  
    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // Chama a API para alterar o Mashguiach
        await ChangeMashguiach(serviceId, mashguiachSelected === "999" ? null : mashguiachSelected);
        alert("Mashguiach atualizado com sucesso!");
        handleClose(); // Fecha o modal após a atualização
      } catch (error) {
        console.error("Erro ao atualizar Mashguiach:", error);
        alert("Erro ao atualizar Mashguiach!");
      }
    };
  
    const fetchMashguichim = async () => {
      const response = await getAllMashguichim();
      if (response) {
        setMashguiachOptions(response);
      }
    };
  
    useEffect(() => {
      fetchMashguichim();
    }, []);
  
    return (
      <CModal visible={isOpen} onClose={handleClose}>
        <CModalHeader closeButton>
          <CModalTitle>Alterar Mashguiach</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <form onSubmit={handleUpdate}>
            <CCol md={12}>
              <CFormLabel>Mashguiach:</CFormLabel>
              <CFormSelect
                value={mashguiachSelected}
                onChange={(e) => setMashguiachSelected(e.target.value)}
              >
                <option value="999">ALEATÓRIO</option>
                {mashguiachOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </CFormSelect>
              <CButton className="mt-4" color="primary" type="submit">
                Atualizar
              </CButton>
            </CCol>
          </form>
        </CModalBody>
      </CModal>
    );
  };
  
  export default ChangeMashguiachModal;
  