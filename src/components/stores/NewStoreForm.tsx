"use client";

import { useEffect, useState } from 'react';
import {
    CCard, CCardBody, CCardHeader, CForm, CFormInput,
    CFormLabel, CFormTextarea, CFormSelect, CButton
} from "@coreui/react-pro";
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim';
import { getStoresTypes } from '@/app/_actions/stores/getStoresType';
import { createStore } from '@/app/_actions/stores/createStore';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Zod schema para validar o formulário
const storeSchema = z.object({
    title: z.string().min(1, { message: "Digite um título para o seu estabelecimento" }),
    address: z.string().min(1, { message: "Digite um endereço para o seu estabelecimento" }),
    isAutomated: z.boolean(),
    isMashguiach: z.boolean(),
    mashguiachId: z.string().optional().nullable(), // Opcional se não for um mashguiach fixo
    storeTypeId: z.string().min(1, { message: "Selecione o tipo de estabelecimento" }), // Não permitir vazio
});

type FormData = z.infer<typeof storeSchema>;

const NewStoreForm = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(storeSchema),
    });

    const router = useRouter();

    // Obtém a sessão do NextAuth e o userId
    const { data: session } = useSession();
    const userId = session?.user?.id; // Aqui o userId será extraído da sessão

    const [mashguiachim, setMashguiachim] = useState<any[]>([]); // Estado para armazenar os mashguiachim
    const [storesType, setStoresType] = useState<any[]>([]); // Estado para armazenar os tipos de estabelecimento

    // Função para buscar tipos de loja
    const fetchStoresType = async () => {
        try {
            const storesTypes = await getStoresTypes();
            setStoresType(storesTypes);
        } catch (error) {
            throw error;
        }
    };

    // Função para buscar mashguiachim
    const fetchMashguiachim = async () => {
        try {
            const mashguichim = await getAllMashguichim();
            setMashguiachim(mashguichim);
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        fetchMashguiachim();
        fetchStoresType();
    }, []);

    // Monitora o valor de isMashguiach para mostrar o select condicionalmente
    const isMashguiach = watch("isMashguiach");

    // Função para lidar com o envio do formulário
    const onSubmit = async (formData: FormData) => {
        if (!userId) {
            console.error("Usuário não autenticado.");
            return;
        }
    
        const updatedFormData = {
            title: formData.title,
            address: formData.address,
            userId, // Inclua o userId
            isAutomated: formData.isAutomated ?? null, // Se não for fornecido, defina como null
            isMashguiach: formData.isMashguiach ?? null, // Se não for fornecido, defina como null
            mashguiachId: formData.mashguiachId || null, // Trate como null se não fornecido
            storeType: {
                connect: {
                    id: formData.storeTypeId, // Conecte o storeType pelo ID
                },
            },
        };
    
        try {
            await createStore(updatedFormData);
            alert("Estabelecimento criado com sucesso!");
            router.push('/stores');
        } catch (error) {
            console.error("Erro ao criar loja:", error);
        }
    };
        
    return (
        <>
            <CCard className="mb-4">
                <CCardHeader>
                    <strong>Novo Estabelecimento</strong>
                </CCardHeader>
                <CCardBody>
                    <CForm onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <CFormLabel htmlFor="title">Nome do Estabelecimento</CFormLabel>
                            <CFormInput
                                type="text"
                                id="title"
                                {...register("title")}
                                invalid={!!errors.title}
                            />
                            {errors.title && <span>{errors.title.message}</span>}
                        </div>
                        <div className="mb-3">
                            <CFormLabel htmlFor="address">Endereço</CFormLabel>
                            <CFormTextarea
                                id="address"
                                rows={3}
                                {...register("address")}
                                invalid={!!errors.address}
                            />
                            {errors.address && <span>{errors.address.message}</span>}
                        </div>

                        {/* Checkbox para "O Estabelecimento é automatizado?" */}
                        <div className="mb-3 form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="isAutomated"
                                {...register("isAutomated")}
                            />
                            <label className="form-check-label" htmlFor="isAutomated">
                                O Estabelecimento é automatizado?
                            </label>
                        </div>

                        {/* Checkbox para "O Mashguiach é fixo?" */}
                        <div className="mb-3 form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="isMashguiach"
                                {...register("isMashguiach")}
                            />
                            <label className="form-check-label" htmlFor="isMashguiach">
                                O Mashguiach é fixo?
                            </label>
                        </div>

                        {/* Campo condicional para selecionar o Mashguiach */}
                        {isMashguiach && (
                            <div className="mb-3">
                                <CFormLabel htmlFor="mashguiachId">Mashguiach</CFormLabel>
                                <CFormSelect
                                    id="mashguiachId"
                                    {...register("mashguiachId")}
                                    invalid={!!errors.mashguiachId}
                                >
                                    <option value="">Selecione um Mashguiach</option>
                                    {mashguiachim.map(mashguiach => (
                                        <option key={mashguiach.id} value={mashguiach.id}>
                                            {mashguiach.name}
                                        </option>
                                    ))}
                                </CFormSelect>
                                {errors.mashguiachId && <span>{errors.mashguiachId.message}</span>}
                            </div>
                        )}

                        <div className="mb-3">
                            <CFormLabel htmlFor="storeTypeId">Tipo de Estabelecimento</CFormLabel>
                            <CFormSelect
                                id="storeTypeId"
                                {...register("storeTypeId")}
                                invalid={!!errors.storeTypeId}
                            >
                                <option value="">Selecione o tipo de estabelecimento</option>
                                {storesType.map(store => (
                                    <option value={store.id} key={store.id}>{store.title}</option>
                                ))}
                            </CFormSelect>
                            {errors.storeTypeId && <span>{errors.storeTypeId.message}</span>}
                        </div>

                        <CButton type="submit" color="primary">
                            Criar Estabelecimento
                        </CButton>
                    </CForm>
                </CCardBody>
            </CCard>
        </>
    );
};

export default NewStoreForm;
