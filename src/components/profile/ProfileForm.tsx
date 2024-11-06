"use client"
import Loading from "@/app/(views)/loading";
import { getUserInfo } from "@/app/_actions/getUserInfo";
import { updateUserInfo } from "@/app/_actions/profile/updateUserInfo";
import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CRow } from "@coreui/react-pro";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type TypeProps = {
    userId: string
}

const schema = z.object({
    name: z.string().min(1, { message: 'Digite ao menos um nome' }),
    email: z.string(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    jewishName: z.string().nullable(),
});

type FormData = z.infer<typeof schema>;

const ProfileForm = ({ userId }: TypeProps) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const fetchUserInfo = async (userId: string) => {
        try {
            setLoading(true);
            const userInfoArray = await getUserInfo(userId);
            if (userInfoArray && userInfoArray.length > 0) {
                const userInfo = userInfoArray[0];
                setValue("name", userInfo.name || "");
                setValue("email", userInfo.email || "");
                setValue("phone", userInfo.phone || "");
                setValue("address", userInfo.address || "");
                setValue("jewishName", userInfo.jewishName || "");
            } else {
                console.error("Nenhum usuário encontrado.");
            }
        } catch (error) {
            console.error("Erro ao buscar informações do usuário:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo(userId);
    }, [userId]);

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            await updateUserInfo({ data, userId });
        } catch (error) {
            console.error("Erro ao atualizar informações do usuário:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loading />;

    return (
        <CCard className="mb-4">
            <CCardHeader>
                <strong>Editar Perfil - {loading && 'Carregando...'}</strong> <small>Configure suas informações</small>
            </CCardHeader>
            <CCardBody>
                <p className="text-body-secondary small">
                    Confira se suas informações estão corretas, isso é essencial para entrarmos em contato.
                </p>
                <CForm onSubmit={handleSubmit(onSubmit)}>
                    <CRow className="mb-3">
                        <CFormLabel htmlFor="inputEmail3" className="col-sm-2 col-form-label">Nome</CFormLabel>
                        <CCol sm={10}>
                            <CFormInput
                                placeholder="Name"
                                aria-label="Name"
                                {...register("name")}
                                invalid={!!errors.name}
                            />
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CFormLabel htmlFor="inputEmail3" className="col-sm-2 col-form-label">E-mail</CFormLabel>
                        <CCol sm={10}>
                            <CFormInput
                                placeholder="Email"
                                aria-label="Email"
                                {...register("email")}
                                invalid={!!errors.email}
                            />
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CFormLabel htmlFor="inputEmail3" className="col-sm-2 col-form-label">Telefone</CFormLabel>
                        <CCol sm={10}>
                            <CFormInput
                                placeholder="Phone"
                                aria-label="Phone"
                                {...register("phone")}
                                invalid={!!errors.phone}
                            />
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CFormLabel htmlFor="inputEmail3" className="col-sm-2 col-form-label">Endereço</CFormLabel>
                        <CCol sm={10}>
                            <CFormInput
                                placeholder="Address"
                                aria-label="Address"
                                {...register("address")}
                                invalid={!!errors.address}
                            />
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CFormLabel htmlFor="inputEmail3" className="col-sm-2 col-form-label">Nome Judaico</CFormLabel>
                        <CCol sm={10}>
                            <CFormInput
                                placeholder="Jewish Name"
                                aria-label="Jewish Name"
                                {...register("jewishName")}
                                invalid={!!errors.jewishName}
                            />
                        </CCol>
                    </CRow>
                    <CCol xs={12}>
                        <CButton color="primary" type="submit">
                            Atualizar Informações
                        </CButton>
                    </CCol>
                </CForm>
            </CCardBody>
        </CCard>
    );
}

export default ProfileForm;
