'use client'
import { addMashguiachFixedJob } from '@/app/_actions/admin/addMashguiachFixedJob'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getAllStores } from '@/app/_actions/stores/getAllStores'
import CertificationForm from '@/components/admin/estabelecimentos/CreateCertificationForm'
import {
  CAvatar,
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CCollapse,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSmartTable,
} from '@coreui/react-pro'
import { Certifications, User } from '@prisma/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export interface WorkScheduleFormData {
  day: string
  timeIn: string | null
  timeOut: string | null
  isDayOff: boolean
}

const Estabelecimentos = () => {
  const [details, setDetails] = useState<number[]>([])
  const [storeData, setStoreData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [mashguiachSelected, setMashguiachSelected] = useState<string>('')
  const [schedule, setSchedule] = useState<WorkScheduleFormData[]>(
    daysOfWeek.map((day) => ({
      day,
      timeIn: '',
      timeOut: '',
      isDayOff: false
    }))
  )

  const fetchEstabelecimentos = async () => {
    const estabelecimentos = await getAllStores()
    if (estabelecimentos) setStoreData(estabelecimentos as any)
  }

  const fetchAllMashguichim = async () => {
    const response = await getAllMashguichim()
    if (response) {
      setMashguiachOptions(response)
    }
  }

  useEffect(() => {
    fetchAllMashguichim()
    fetchEstabelecimentos()
  }, [])

  const columns = [
    {
      key: 'avatar',
      label: '',
      filter: false,
      sorter: false,
    },
    {
      key: 'title',
      label: 'Nome',
      _style: { width: '40%' },
    },
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      filter: false,
      sorter: false,
    },
  ]

  const toggleDetails = (index: number) => {
    const position = details.indexOf(index)
    let newDetails = [...details]
    if (position !== -1) {
      newDetails.splice(position, 1)
    } else {
      newDetails.push(index)
    }
    setDetails(newDetails)
  }

  const [visible, setVisible] = useState(false)
  const [selectedStore, setSelectedStore] = useState('')
  const [mashguiachOptions, setMashguiachOptions] = useState<User[]>([])
  const [price, setPrice] = useState<number>()
  const [salaryHour, setSalaryHour] = useState<number>()

  const handleCertificationAdded = () => {
    fetchEstabelecimentos() // Atualiza os dados da tabela
  }

  const handleCertificationAddButton = (storeId: string) => {
    setVisible(!visible)
    setSelectedStore(storeId)
  }

  const handleSetSchedulePreset = (timeIn: string, timeOut: string) => {
    setSchedule(
      daysOfWeek.map((day) => ({
        day,
        timeIn,
        timeOut,
        isDayOff: false
      }))
    )
  }

  const handleAddMashguiachModal = (storeId: string) => {
    setSelectedStore(storeId)
    setModalVisible(!modalVisible)
  }

  const handleChangeSchedule = (index: number, field: keyof WorkScheduleFormData, value: string | boolean) => {
    const updatedSchedule = [...schedule]
    updatedSchedule[index][field] = value as never
    setSchedule(updatedSchedule)
  }

  const handleSubmit = async () => {
    if (!mashguiachSelected || !price || !salaryHour) {
      alert('Selecione um Mashguiach e defina um salário válido!')
      return
    }

    try {
      await addMashguiachFixedJob(mashguiachSelected, selectedStore, price, salaryHour, schedule)
      alert('Mashguiach registrado com sucesso!')
      setModalVisible(false)
      fetchEstabelecimentos()
    } catch (error) {
      alert(error || 'Erro ao registrar Mashguiach')
      console.error(error)
    }
  }

  // Função para gerar o PDF diretamente
  const handleDownloadPDF = async (certificate: any, storename: string) => {
    console.log('Gerando PDF do certificado:', certificate)
    const element = document.createElement('div')
    element.style.width = '297mm'
    element.style.height = '210mm'
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.backgroundImage = `url('/images/certificado.png')`
    element.style.backgroundSize = 'cover'
    element.style.backgroundPosition = 'center'
    element.style.padding = '5%'

    // Adiciona o conteúdo do certificado ao elemento
    element.innerHTML = `
      <div style="position: absolute; top: 35%; left: 10%; width: 80%; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="font-family: 'Cardo', serif; font-size: 20px; font-weight: bold; margin-bottom: 10px;">
          ${storename || 'Nome do Estabelecimento'}
        </h1>
        <h2 style="font-size: 16px; color: red; margin-bottom: 20px;">
          ${certificate.HashgachotType || 'Tipo não informado'}
        </h2>
        <p style="font-size: 12px; margin-bottom: 10px;">
          <b>${certificate.description || 'Descrição em português não disponível'}</b>
        </p>
        <p style="font-size: 12px; margin-bottom: 20px;">
          ${certificate.englishDescription || 'Descrição em inglês não disponível'}
        </p>
        <p style="font-size: 10px; margin-bottom: 5px;">
          <b>Data de expedição:</b> ${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString('pt-BR') : 'Data não informada'}
        </p>
        <p style="font-size: 10px; margin-bottom: 5px;">
          <b>Data de validade:</b> ${certificate.validationDate ? new Date(certificate.validationDate).toLocaleDateString('pt-BR') : 'Data não informada'}
        </p>
        <p style="font-size: 10px; margin-top: 20px;">
          Obs: ${certificate.observation || 'Sem observações adicionais'}
        </p>
      </div>
    `

    document.body.appendChild(element)

    const canvas = await html2canvas(element, { scale: 2 })
    const pdf = new jsPDF('l', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
    pdf.save('certificado.pdf')

    document.body.removeChild(element)
  }

  return (
    <>
      <CertificationForm
        selectedStore={selectedStore}
        visible={visible}
        setVisible={setVisible}
        onCertificationAdded={handleCertificationAdded}
      />

      <CSmartTable
        activePage={2}
        cleaner
        clickableRows
        columns={columns}
        columnFilter
        columnSorter
        footer
        items={storeData}
        itemsPerPageSelect
        itemsPerPage={5}
        pagination
        onFilteredItemsChange={(items) => console.log(items)}
        onSelectedItemsChange={(items) => console.log(items)}
        scopedColumns={{
          avatar: (item: any) => (
            <td>
              <CAvatar src={`/images/avatars/avatar.jpg`} />
            </td>
          ),
          show_details: (item: any) => (
            <td className="py-2">
              <CButton
                color="primary"
                variant="outline"
                shape="square"
                size="sm"
                onClick={() => toggleDetails(item.id)}
              >
                {details.includes(item.id) ? 'Esconder' : 'Mostrar'}
              </CButton>
            </td>
          ),
          details: (item) => (
            <CCollapse visible={details.includes(item.id)}>
              <CCardBody className="p-3">
                <p className="text-muted">
                  <b>Endereço:</b> {item.address_street} {item.address_number},{' '}
                  {item.address_neighborhood}, {item.address_city} - {item.address_state} -{' '}
                  {item.address_zipcode}
                </p>
                <p className="text-muted">
                  <b>Telefone:</b> {item.phone}
                </p>
                <p className="text-muted">
                  <b>T. Comercial:</b> {item.comercialPhone}
                </p>
                Certificados:
                {item.Certifications &&
                  item.Certifications.map((certification: any, index: number) => (
                    <CButton
                      key={index}
                      color="dark"
                      size="lg"
                      className="m-1"
                      onClick={() => handleDownloadPDF(certification, item.title)}
                    >
                      {certification.title || `Certificado ${index + 1}`}
                    </CButton>
                  ))}
                <p>Mashguichim Fixos:</p>
                <div className="mb-3">
                  <div className="d-flex flex-row mb-2">
                    <CButton
                      className="flex-fill me-1"
                      size="lg"
                      color="primary"
                      href={`./estabelecimentos/editar/${item.id}`}
                    >
                      Editar Loja
                    </CButton>
                    <CButton
                      className="flex-fill ms-1"
                      size="lg"
                      color="primary"
                    >
                      Desativar
                    </CButton>
                  </div>
                  <div className="d-flex flex-row mb-2">
                    <CButton className="flex-fill me-1" size="lg" color="primary">
                      <Link
                        className="text-white no-underline"
                        href={`https://wa.me/${item.phone}`}
                      >
                        Whatsapp
                      </Link>
                    </CButton>
                    <CButton
                      className="flex-fill ms-1"
                      size="lg"
                      color="primary"
                      onClick={() => handleCertificationAddButton(item.id)}
                    >
                      + Certificado
                    </CButton>
                    <CButton className="flex-fill ms-1" size="lg" color="primary" onClick={() => handleAddMashguiachModal(item.id)}>
                      Registrar Mashguiach
                    </CButton>
                  </div>
                </div>
              </CCardBody>
            </CCollapse>
          ),
        }}
        selectable
        sorterValue={{ column: 'name', state: 'asc' }}
        tableProps={{
          className: 'add-this-class',
          responsive: true,
          striped: true,
          hover: true,
        }}
        tableBodyProps={{
          className: 'align-middle',
        }}
      />
    </>
  )
}

export default Estabelecimentos