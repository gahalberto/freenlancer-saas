'use client'
import { addMashguiachFixedJob } from '@/app/_actions/admin/addMashguiachFixedJob'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'
import { getAllStores } from '@/app/_actions/stores/getAllStores'
import CertificateModal from '@/components/admin/estabelecimentos/certificationModal'
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
  const [certificateVisible, setCertificateVisible] = useState(false)
  const [certificateSelected, setCertificateSelected] = useState('')
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
    console.log(`Users: ${storeData}`)
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
  const [mashguiachList, setMashguiachList] = useState<User[]>([])
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


  const handleShowCertificate = (certification: any) => {
    setCertificateSelected(certification)
    setCertificateVisible(true)
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

  return (
    <>
      <CertificationForm
        selectedStore={selectedStore}
        visible={visible}
        setVisible={setVisible}
        onCertificationAdded={handleCertificationAdded} // Passa o callback
      />

      <CertificateModal
        visible={certificateVisible}
        setVisible={setCertificateVisible}
        certificateId={certificateSelected}
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
                      onClick={() => handleShowCertificate(certification)}
                    >
                      {certification.title || `Certificado ${index + 1}`}
                    </CButton>
                  ))}
                <p>Mashguichim Fixos:</p>
                {/* Agrupamento dos botões */}
                {/* Agrupamento dos botões */}
                <div className="mb-3">
                  {/* Linha 1: Editar Loja e Desativar */}
                  <div className="d-flex flex-row mb-2">
                    <CButton
                      className="flex-fill me-1" // flex-fill faz o botão crescer; me-1 adiciona margem à direita
                      size="lg"
                      color="primary"
                      href={`./estabelecimentos/editar/${item.id}`}
                    >
                      Editar Loja
                    </CButton>
                    <CButton
                      className="flex-fill ms-1" // ms-1 adiciona margem à esquerda
                      size="lg"
                      color="primary"
                      // onClick={() => handleDesativar(item.id)}
                    >
                      Desativar
                    </CButton>
                  </div>

                  {/* Linha 2: Whatsapp e + Certificado */}
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
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Registro de Mashguiach</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CCol>
              <CFormLabel>Mashguiach:</CFormLabel>
              <CFormSelect value={mashguiachSelected} onChange={(e) => setMashguiachSelected(e.target.value)}>
                <option value="">Selecione um Mashguiach</option>
                {mashguiachOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol style={{ marginTop: '10px' }}>
              <CFormLabel>Salário</CFormLabel>
              <CFormInput
                type="number"
                placeholder="R$"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </CCol>

            <CCol style={{ marginTop: '10px' }}>
              <CFormLabel>Salário por hora:</CFormLabel>
              <CFormInput
                type="number"
                placeholder="R$"
                value={salaryHour}
                onChange={(e) => setSalaryHour(Number(e.target.value))}
              />
            </CCol>

            <h5 className="mt-3">Horários de Trabalho</h5>
                        {/* Botões para preencher automaticamente os horários */}
                        <div className="d-flex justify-content-between mb-3">
              <CButton color="success" onClick={() => handleSetSchedulePreset('07:00', '16:00')}>
                07:00 às 16:00
              </CButton>
              <CButton color="warning" onClick={() => handleSetSchedulePreset('16:00', '00:00')}>
                16:00 às 00:00
              </CButton>
            </div>

            {schedule.map((day, index) => (
              <div key={day.day} className="d-flex align-items-center mb-2">
                <CFormLabel className="me-2">{day.day}</CFormLabel>
                <CFormInput
                  type="time"
                  value={day.timeIn || ''}
                  onChange={(e) => handleChangeSchedule(index, 'timeIn', e.target.value)}
                  disabled={day.isDayOff}
                  className="me-2"
                />
                <CFormInput
                  type="time"
                  value={day.timeOut || ''}
                  onChange={(e) => handleChangeSchedule(index, 'timeOut', e.target.value)}
                  disabled={day.isDayOff}
                  className="me-2"
                />
                <input
                  type="checkbox"
                  checked={day.isDayOff}
                  onChange={(e) => handleChangeSchedule(index, 'isDayOff', e.target.checked)}
                />
                <label className="ms-2">Folga</label>
              </div>
            ))}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Fechar
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            Salvar
          </CButton>
        </CModalFooter>
      </CModal>

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
