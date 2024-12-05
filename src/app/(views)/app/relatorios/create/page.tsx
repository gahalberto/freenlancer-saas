"use client";

import { createReport } from "@/app/_actions/reports/createReport";
import { getAllStores } from "@/app/_actions/stores/getAllStores";
import { getWorkingStores } from "@/app/_actions/stores/getWorkingStores";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CFormTextarea, CMultiSelect, CRow } from "@coreui/react-pro";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Option {
    label: string;
    value: string | number; // Pode ser string ou number
}

const CreateReportPage = () => {
    const {data: session} = useSession();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [store, setStore] = useState<string | null>(null);
    const [options, setOptions] = useState<Option[]>([]);
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

    const [errors, setErrors] = useState<{ title?: string; description?: string; store?: string }>({});

    const router = useRouter();

    const fetchStores = async () => {
        const response = await getWorkingStores(`${session?.user.id}`);
        if (response) {
            const formattedOptions = response.map((store: any) => ({
                value: store.id,
                label: store.title,
            }));
            setOptions(formattedOptions);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const validate = () => {
        const newErrors: { title?: string; description?: string; store?: string } = {};

        if (!title.trim()) newErrors.title = "Digite um título para o curso";
        if (!description.trim()) newErrors.description = "Digite uma descrição para o curso";
        if (!store) newErrors.store = "Selecione um estabelecimento";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('store', store || '');
        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Enviar dados para o servidor (substitua pela sua lógica de envio de dados)
        try {
            // Exemplo de envio (substitua a URL pelo endpoint correto)
            const response = await fetch('/api/reports/createReport', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                // Redirecionar após o sucesso
                router.push('/relatorios');
            } else {
                console.error("Erro ao enviar o formulário");
            }
        } catch (error) {
            console.error("Erro ao enviar o formulário", error);
        }
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <strong>Criar novo relatório</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CForm className="row g-3" onSubmit={handleSubmit}>
                                <CCol md={12}>
                                    <CFormLabel>Título:</CFormLabel>
                                    <CFormInput
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        invalid={!!errors.title}
                                    />
                                    {errors.title && (
                                        <p className="text-danger">{errors.title}</p>
                                    )}
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>
                                        Observação: <small>Relate o que aconteceu?</small>
                                    </CFormLabel>
                                    <CFormTextarea
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        invalid={!!errors.description}
                                    ></CFormTextarea>
                                    {errors.description && (
                                        <p className="text-danger">{errors.description}</p>
                                    )}
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>Estabelecimento:</CFormLabel>
                                    <CMultiSelect
                                        multiple={false}
                                        options={options}
                                        onChange={(selected) => {
                                            setStore(String(selected[0]?.value) || null);
                                        }}
                                    />
                                    {errors.store && (
                                        <p className="text-danger">{errors.store}</p>
                                    )}
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>Imagem:</CFormLabel>
                                    <CFormInput
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        invalid={!!error}
                                    />
                                    {error && <p className="text-danger">{error}</p>}
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
        </>
    );
};

export default CreateReportPage;
