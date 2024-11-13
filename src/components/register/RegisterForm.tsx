"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cilApplications, cilLockLocked, cilMap, cilPhone, cilUser } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CButton, CForm, CFormInput, CFormLabel, CFormSelect, CInputGroup, CInputGroupText } from "@coreui/react-pro";
import { registerUser } from "@/app/_actions/register";
import { useRouter } from "next/navigation";

// Esquema de validação usando Zod
const registerSchema = z.object({
    roleId: z.string().min(1, { message: "Escolha se você é um Mashguiach ou Restaurante!" }),
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }),
    phone: z.string().min(6, ({ message: "Telefone é obrigatório" })),
    address: z.string().min(1, ({ message: "Endereço é obrigatório" })),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Confirmação de senha é obrigatória" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // Caminho para o campo que está com erro
});

type RegisterSchema = z.infer<typeof registerSchema>;

const RegisterForm = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterSchema) => {
        try {
            await registerUser(data);
            alert("Usuário registrado com sucesso!"); // Feedback para o usuário
            router.push('/login');
        } catch (error) {
            if (error instanceof Error) {
                // Se for um erro do tipo Error, acesse a mensagem
            } else {
                // Se for outro tipo de erro, exiba uma mensagem genérica
                alert("Ocorreu um erro desconhecido.");
            }
        }
    };

    return (
        <>
            <CForm onSubmit={handleSubmit(onSubmit)}>
                <h1>Registre-se</h1>
                <p className="text-medium-emphasis">Crie uma conta na plataforma do Dept. de Kashrut da Beit Yaakov.</p>
                <CInputGroup className="mb-3">
                    {errors.roleId && <span className="text-danger">{errors.roleId.message}</span>}
                    <CInputGroupText>
                        <CIcon icon={cilApplications} />
                    </CInputGroupText>
                    <CFormSelect id="inputState"
                        {...register("roleId")}
                        invalid={!!errors.roleId}
                    >
                        <option>Escolha uma opção</option>
                        <option value={1}>Mashguiach(a)</option>
                        <option value={2}>Estabelecimento</option>
                    </CFormSelect>

                </CInputGroup>

                {errors.name && <span className="text-danger">{errors.name.message}</span>}
                <CInputGroup className="mb-3">

                    <CInputGroupText>
                        <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                        placeholder="Nome completo"
                        autoComplete="username"
                        {...register("name")}
                    />
                </CInputGroup>

                {errors.email && <span className="text-danger">{errors.email.message}</span>}
                <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                        placeholder="Email"
                        autoComplete="email"
                        {...register("email")}
                    />
                </CInputGroup>

                {errors.phone && <span className="text-danger">{errors.phone.message}</span>}
                <CInputGroup className="mb-3">
                    <CInputGroupText>
                        <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                        placeholder="Telefone"
                        autoComplete="phone"
                        {...register("phone")}
                    />
                </CInputGroup>

                {errors.address && <span className="text-danger">{errors.address.message}</span>}
                <CInputGroup className="mb-3">
                    <CInputGroupText>
                        <CIcon icon={cilMap} />
                    </CInputGroupText>
                    <CFormInput
                        placeholder="Endereço - Bairro - Cidade"
                        autoComplete="address"
                        {...register("address")}
                    />
                </CInputGroup>

                {errors.password && <span className="text-danger">{errors.password.message}</span>}
                <CInputGroup className="mb-3">
                    <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                        type="password"
                        placeholder="Senha"
                        autoComplete="new-password"
                        {...register("password")}
                    />
                </CInputGroup>

                {errors.confirmPassword && (
                    <span className="text-danger">{errors.confirmPassword.message}</span>
                )}

                <CInputGroup className="mb-4">
                    <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                        type="password"
                        placeholder="Repita a senha"
                        autoComplete="new-password"
                        {...register("confirmPassword")}
                    />
                </CInputGroup>

                <div className="d-grid">
                    <CButton type="submit" color="success">Criar conta</CButton>
                </div>
            </CForm>
        </>
    );
};

export default RegisterForm;
