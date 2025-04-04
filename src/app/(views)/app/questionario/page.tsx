"use client"
import { postQuestionario } from "@/app/_actions/postQuestionario";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CRow } from "@coreui/react-pro";
import { zodResolver } from "@hookform/resolvers/zod";
import { getServerSession } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
    jewishName: z.string().min(1, { message: "Digite o seu nome judaico" }),
    maritalStatus: z.string(),
    weddingLocation: z.string().optional(),
    wifeName: z.string().optional(),
    rabbiMarried: z.string().optional(),
    rabbi: z.string().min(1, { message: "Digite o Nome e Sobrenome do seu Rabino" }),
    currentSynagogue: z.string().min(1, "Digite o nome da sinagoga que você frequenta."),
    shiur: z.string().min(1, { message: "Responda se você participa de algum Shiur ou não" }),
    daven: z.string().min(1, { message: "Responda quantas vocês você reza e se com Minyan" }),
    jewishStudies: z.string().min(1, { message: "Responda se você teve algum estudo judaico, colel, escola, yeshiva, etc..." }),
    kashrutBooks: z.string().min(1, { message: "Quais livros de Kashrut você já leu/estudou?" }),
    kashrutCourses: z.string().min(1, { message: "Quais cursos de Kashrut você já fez?" }),
    ashgachotWorked: z.string().min(1, { message: "Para quais outros serviços de Kashrut você já trabalhou?" }),
    kashrutLevel: z.string().min(1, { message: "Responda qual o seu nível de Kashrut" }),
    shomerShabat: z.boolean(),
    childrenSchool: z.string().optional(),
    wifeCoveredHair: z.string().optional(),
    montherSingleName: z.string().min(1, { message: "Responde o nome de solteiro da sua mãe" }),
    giurInFamily: z.string().optional(),
    rabbiOfGiur: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const Questionario = () => {
    const [maritalStatus, setMaritalStatus] = useState(""); // Estado para o estado civil
    const [userId, setUserId] = useState<string | ''>('');
    const [hasAnswered, setHasAnswered] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const fetchSession = async () => {
          const session = await getSession();
          setUserId(session?.user?.id || '');
          setHasAnswered(session?.user?.asweredQuestions || false);
        };
        fetchSession();
      }, []);
    
      const router = useRouter(); // Certifique-se de que isso está dentro do componente funcional


    const onSubmit = async (data: FormData) => {
        const processedData = {
            userId, // Certifique-se de passar o `userId` corretamente
            jewishName: data.jewishName,
            maritalStatus: parseInt(data.maritalStatus), // Convertendo string para número
            weddingLocation: data.weddingLocation || null, // Convertendo valores opcionais para null
            wifeName: data.wifeName || null,
            rabbiMarried: data.rabbiMarried || null,
            rabbi: data.rabbi || null,
            currentSynagogue: data.currentSynagogue || null,
            shiur: data.shiur || null,
            daven: parseInt(data.daven), // Convertendo string para número
            jewishStudies: data.jewishStudies || null,
            kashrutBooks: data.kashrutBooks || null,
            kashrutCourses: data.kashrutCourses || null,
            ashgachotWorked: data.ashgachotWorked || null,
            kashrutLevel: parseInt(data.kashrutLevel), // Convertendo string para número
            shomerShabat: data.shomerShabat || false, // Booleano
            childrenSchool: data.childrenSchool || null,
            wifeCoveredHair: data.wifeCoveredHair ? parseInt(data.wifeCoveredHair) : null, // Convertendo string para número ou null
            montherSingleName: data.montherSingleName,
            giurInFamily: data.giurInFamily || null,
            rabbiOfGiur: data.rabbiOfGiur || null,
        };

        try {
            await postQuestionario(processedData);
            setShowSuccessMessage(true);
            setHasAnswered(true);
            
            // Redireciona após 3 segundos
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (error) {
            console.error("Erro ao enviar os dados:", error);
        }

        console.log(data);
    };


    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Questionário do Mashguiach </strong><small>Obrigatório</small>
                        </CCardHeader>
                        <CCardBody>
                            {showSuccessMessage && (
                                <CAlert color="success" className="mb-4">
                                    Questionário enviado com sucesso! Você será redirecionado em alguns segundos.
                                </CAlert>
                            )}
                            
                            {hasAnswered && !showSuccessMessage && (
                                <CAlert color="info" className="mb-4">
                                    Você já respondeu este questionário. As informações abaixo não podem ser alteradas.
                                </CAlert>
                            )}
                            
                            <p className="text-body-secondary small">
                                Esse questionário é importante para que você seja aprovado como o Mashguiach da Beit Yaakov.
                            </p>
                            <CForm className="row g-3" onSubmit={handleSubmit(onSubmit)}>
                                <CCol md={6}>
                                    <CFormLabel>Nome Judaico</CFormLabel>
                                    <CFormInput type="text"
                                        {...register("jewishName")}
                                        invalid={!!errors.jewishName}
                                        disabled={hasAnswered}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="inputState">Estado Civil</CFormLabel>
                                    <CFormSelect id="inputState"
                                        {...register("maritalStatus")}
                                        onChange={(e) => setMaritalStatus(e.target.value)}
                                        invalid={!!errors.maritalStatus}
                                        disabled={hasAnswered}
                                    >
                                        <option>Escolha...</option>
                                        <option value={1}>Solteiro(a)</option>
                                        <option value={2}>Casado(a)</option>
                                        <option value={3}>Divorciado(a)</option>
                                        <option value={4}>Viúvo(a)</option>
                                    </CFormSelect>
                                </CCol>
                                {(maritalStatus === '2' || maritalStatus === '3' || maritalStatus === '4') && (
                                    <>
                                        <CCol md={6}>
                                            <CFormLabel>Onde casou?</CFormLabel>
                                            <CFormInput type="text"
                                                {...register("weddingLocation")}
                                                invalid={!!errors.weddingLocation}
                                                disabled={hasAnswered}
                                            />
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormLabel>Qual rabino casou?</CFormLabel>
                                            <CFormInput type="text"
                                                {...register("rabbiMarried")}
                                                invalid={!!errors.rabbiMarried}
                                                disabled={hasAnswered}
                                            />
                                        </CCol>

                                        <CCol md={6}>
                                            <CFormLabel>Qual nome da esposa/marido?</CFormLabel>
                                            <CFormInput type="text"
                                                {...register("wifeName")}
                                                invalid={!!errors.wifeName}
                                                disabled={hasAnswered}
                                            />
                                        </CCol>

                                        <CCol md={6}>
                                            <CFormLabel htmlFor="inputState">Esposa cobre o cabelo?</CFormLabel>
                                            <CFormSelect id="inputState"
                                                {...register("wifeCoveredHair")}
                                                invalid={!!errors.wifeCoveredHair}
                                                disabled={hasAnswered}
                                            >
                                                <option>Escolha...</option>
                                                <option value={1}>Sempre</option>
                                                <option value={2}>Apenas no trabalho</option>
                                                <option value={3}>Apenas no Shabat</option>
                                                <option value={4}>Apenas na Sinagoga</option>
                                                <option value={5}>Outro</option>
                                            </CFormSelect>
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormLabel htmlFor="inputState">Escola que os filhos estudam?</CFormLabel>
                                            <CFormInput
                                                {...register("childrenSchool")}
                                                invalid={!!errors.childrenSchool}
                                                disabled={hasAnswered}
                                            />
                                        </CCol>

                                    </>
                                )}
                                <CCol xs={6}>
                                    <CFormLabel>Qual o nome do seu Rabino?</CFormLabel>
                                    <CFormInput placeholder="Nome e Sobrenome do Rabino"
                                        {...register("rabbi")}
                                        invalid={!!errors.rabbi}
                                        disabled={hasAnswered}
                                    />
                                </CCol>
                                <CCol xs={6}>
                                    <CFormLabel>Qual sinagoga você frequenta?</CFormLabel>
                                    <CFormInput placeholder="Nome da sinagoga & bairro"
                                        {...register("currentSynagogue")}
                                        invalid={!!errors.currentSynagogue}
                                        disabled={hasAnswered}
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormLabel>Participa de algum Shiur? Caso sim, qual? Onde?</CFormLabel>
                                    <CFormTextarea rows={2}
                                        {...register("shiur")}
                                        invalid={!!errors.shiur}
                                        disabled={hasAnswered}
                                    ></CFormTextarea>
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel htmlFor="inputState">Reza com Miniam?</CFormLabel>
                                    <CFormSelect id="inputState"
                                        {...register("daven")}
                                        invalid={!!errors.daven}
                                        disabled={hasAnswered}
                                    >
                                        <option>Escolha...</option>
                                        <option value={1}>1 vez por dia</option>
                                        <option value={2}>2 vezes por dia</option>
                                        <option value={3}>3 vezes por dia</option>
                                        <option value={4}>Não rezo</option>
                                        <option value={5}>Não rezo com miniam mas rezo</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Teve estudos judaicos? Yeshiva ou Colel?</CFormLabel>
                                    <CFormInput
                                        {...register("jewishStudies")}
                                        invalid={!!errors.jewishStudies}
                                        disabled={hasAnswered}
                                    />
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>Quais livros sobre Kashrut já estudou?</CFormLabel>
                                    <CFormTextarea rows={4}
                                        {...register("kashrutBooks")}
                                        invalid={!!errors.kashrutBooks}
                                        disabled={hasAnswered}
                                    ></CFormTextarea>
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>Já realizou algum curso de Kashrut? onde e quando?</CFormLabel>
                                    <CFormTextarea rows={4}
                                        {...register("kashrutCourses")}
                                        invalid={!!errors.kashrutCourses}
                                        disabled={hasAnswered}
                                    ></CFormTextarea>
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>Para quais certificadoras já trabalhou?
                                    </CFormLabel>
                                    <CFormTextarea rows={2}
                                        {...register("ashgachotWorked")}
                                        invalid={!!errors.ashgachotWorked}
                                        disabled={hasAnswered}
                                    ></CFormTextarea>
                                </CCol>

                                <CCol md={6}>
                                    <CFormLabel >Que nível classifica a Kashrut em sua casa?</CFormLabel>
                                    <CFormSelect
                                        {...register("kashrutLevel")}
                                        invalid={!!errors.kashrutLevel}
                                        disabled={hasAnswered}
                                    >
                                        <option>Escolha...</option>
                                        <option value={1}>Correta</option>
                                        <option value={2}>Médiana</option>
                                        <option value={3}>Mehadrin</option>
                                    </CFormSelect>
                                </CCol>

                                <CCol md={6}>
                                    <CFormLabel>É Shomer Shabat?</CFormLabel>
                                    <CFormCheck
                                        type="checkbox"
                                        id="shomerShabat"
                                        label="É Shomer Shabat?"
                                        {...register("shomerShabat")}
                                        invalid={!!errors.shomerShabat}
                                        disabled={hasAnswered}
                                    />
                                    {errors.shomerShabat && <p className="text-danger">{errors.shomerShabat.message}</p>}
                                </CCol>

                                <CCol md={12}>
                                    <CFormLabel>Nome de solteiro da mãe</CFormLabel>
                                    <CFormInput
                                        {...register("montherSingleName")}
                                        invalid={!!errors.montherSingleName}
                                        disabled={hasAnswered}
                                    />
                                </CCol>


                                <CCol md={6}>
                                    <CFormLabel>Há conversão na família?</CFormLabel>
                                    <CFormInput
                                        {...register("giurInFamily")}
                                        invalid={!!errors.giurInFamily}
                                        disabled={hasAnswered}
                                    />
                                </CCol>

                                <CCol md={6}>
                                    <CFormLabel>Caso haja conversão, o rabino que realizou?</CFormLabel>
                                    <CFormInput
                                        {...register("rabbiOfGiur")}
                                        invalid={!!errors.rabbiOfGiur}
                                        disabled={hasAnswered}
                                    />
                                </CCol>



                                <CCol xs={12}>
                                    <CButton color="primary" type="submit" disabled={hasAnswered}>
                                        Enviar
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

export default Questionario;
