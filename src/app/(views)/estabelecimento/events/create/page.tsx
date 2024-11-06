"use client";

import { useEffect, useState } from "react";
import { CreateEvent } from "@/app/_actions/events/createEvent";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDatePicker,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from "@coreui/react-pro";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getStores } from "@/app/_actions/stores/getStores";
import { Stores } from "@prisma/client";

const schema = z.object({
  title: z.string().min(1, { message: "Digite um título para o evento" }),
  responsable: z.string().min(1, { message: "Digite o responsável pelo evento" }),
  responsableTelephone: z.string().min(1, { message: "Digite o número de um responsável pelo evento." }),
  nrPax: z.string(),
  address: z.string().min(1, { message: "Digite o nome do cliente do evento" }),
  store: z.string().min(1, { message: "Selecione uma loja" }),
  eventType: z.string().min(1, { message: "Digite o tipo do evento, bar mitzvah?" }),
  serviceType: z.string().min(1, { message: "O que será servido? Qual tipo de serviço?" }),
  date: z.string().refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, { message: "Data inválida" }),
});

type FormData = z.infer<typeof schema>;

const CreateEventForm = () => {
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [disabled, setDisabled] = useState(false);
  const [storeList, setStoreList] = useState<Stores []>([]);

  const fetchStores = async () => {
    try {
      if (session?.user?.id) {
        const response = await getStores(session.user.id);
        if (response) {
          setStoreList(response);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar lojas:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchStores();
    }
  }, [session, status]);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setDisabled(true);

    if (!session || !session.user) {
      console.log("Usuário não autenticado");
      setDisabled(false);
      return;
    }

    const eventData = {
      title: data.title,
      responsable: data.responsable,
      responsableTelephone: data.responsableTelephone,
      nrPax: parseInt(data.nrPax),
      address: data.address,
      eventType: data.eventType,
      serviceType: data.serviceType,
      date: new Date(selectedDate),
      eventOwner: {
        connect: { id: session.user.id }, // Referencia o dono do evento
      },
      store: {
        connect: { id: data.store }, // Conecta o evento à loja usando o ID da loja
      },
      clientName: data.responsable,
      isApproved: false,
    };
    
    try {
      const response = await CreateEvent(eventData);
      if (response) {
        router.push(`/estabelecimento/events/${response}`);
      }
    } catch (error) {
      console.error("Erro ao criar o evento:", error);
      setDisabled(false); // Reabilitar o formulário em caso de erro
    }
    
    
    
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Criação de Evento</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
              Confira todos os dados do evento. Após o cadastro, o evento será enviado para aprovação.
            </p>
            <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
              <CCol md={6}>
                <CFormLabel>Nome do Evento:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register("title")}
                  invalid={!!errors.title}
                />
                {errors.title && <p>{errors.title.message}</p>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Responsável pelo Evento:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register("responsable")}
                  invalid={!!errors.responsable}
                />
                {errors.responsable && <p>{errors.responsable.message}</p>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Telefone do responsável:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register("responsableTelephone")}
                  invalid={!!errors.responsableTelephone}
                />
                {errors.responsableTelephone && <p>{errors.responsableTelephone.message}</p>}
              </CCol>

              <CCol md={12}>
                <CFormLabel>Estabelecimento:</CFormLabel>
                <CFormSelect
                  disabled={disabled}
                  {...register("store")}
                  invalid={!!errors.store}>
                  <option>Selecione o estabelecimento</option>
                  {storeList.map((item, index) => (
                    <option value={item.id} key={index}>{item.title}</option>
                  ))}
                </CFormSelect>

                {errors.store && <p>{errors.store.message}</p>}
              </CCol>
              <CCol md={12}>
                <CFormLabel>Endereço do Evento:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register("address")}
                  invalid={!!errors.address}
                />
                {errors.address && <p>{errors.address.message}</p>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Tipo do Evento:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register("eventType")}
                  invalid={!!errors.eventType}
                />
                {errors.eventType && <p>{errors.eventType.message}</p>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Serviço do Evento:</CFormLabel>
                <CFormInput
                  type="text"
                  disabled={disabled}
                  {...register("serviceType")}
                  invalid={!!errors.serviceType}
                />
                {errors.serviceType && <p>{errors.serviceType.message}</p>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Dia do Evento:</CFormLabel>
                <CDatePicker
                  disabled={disabled}
                  onDateChange={(date) => {
                    if (date instanceof Date && !isNaN(date.getTime())) {
                      setValue("date", date.toISOString().split("T")[0]);
                      setSelectedDate(date.toISOString().split("T")[0]);
                    }
                  }}
                />
                {errors.date && <p>{errors.date.message}</p>}
              </CCol>

              <CCol md={6}>
                <CFormLabel>Qtd de Pax:</CFormLabel>
                <CFormInput
                  type="number"
                  disabled={disabled}
                  {...register("nrPax")}
                  invalid={!!errors.nrPax}
                />
                {errors.nrPax && <p>{errors.nrPax.message}</p>}
              </CCol>

              <CButton type="submit" color="primary" disabled={disabled}>
                Criar Evento
              </CButton>
            </form>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default CreateEventForm;
