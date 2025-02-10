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

const Estabelecimentos = () => {
  const [details, setDetails] = useState<number[]>([])
  const [storeData, setStoreData] = useState([])
  const [certificateVisible, setCertificateVisible] = useState(false)
  const [certificateSelected, setCertificateSelected] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [mashguiachSelected, setMashguiachSelected] = useState<string>('')

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
  const [price, setPrice] = useState(0)

  const handleCertificationAdded = () => {
    fetchEstabelecimentos() // Atualiza os dados da tabela
  }

  const handleCertificationAddButton = (storeId: string) => {
    setVisible(!visible)
    setSelectedStore(storeId)
  }

  const handleShowCertificate = (certification: any) => {
    setCertificateSelected(certification)
    setCertificateVisible(true)
  }

  const handleAddMashguiachModal = (storeId: string) => {
    setSelectedStore(storeId)
    setModalVisible(!modalVisible)
  }

  const handleAddMashguiach = async () => {
    try {
      const res = await addMashguiachFixedJob(mashguiachSelected, selectedStore, price)
      if (res) {
        fetchEstabelecimentos()
        setModalVisible(false)
      }
      setSelectedStore('')
      setMashguiachSelected('')
      setPrice(0)
    } catch (error) {
      alert(error)
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
                <p className="text-muted">
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
                  </p>
                  <p>Mashguichim Fixos:{" "}
                  {item.fixedJobs && item.fixedJobs.length > 0
                  ? item.fixedJobs
                      .filter((job: any) => job.mashguiach) // Filtra somente os fixedJobs que possuem mashguiach
                      .map((job: any) => job.mashguiach.name) // Mapeia para obter o nome do mashguiach
                      .join(', ') || 'Não foram encontrados Mashguiach Fixo para esse estabelecimento!' // Junta os nomes em uma string separada por vírgulas ou exibe 'NAO TEM'
                  : 'Não foram encontrados Mashguiach Fixo para esse estabelecimento!'}

                  </p>
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
                  </div>

                  {/* Linha 3: Registrar Mashguiach */}
                  <div className="d-flex flex-row">
                    <CButton
                      className="flex-fill"
                      size="lg"
                      color="primary"
                      style={{ marginBottom: '20px' }}
                      onClick={() => handleAddMashguiachModal(item.id)}
                    >
                      Registrar Mashguiach ao estabelecimento
                    </CButton>
                  </div>
                </div>
                <CModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  aria-labelledby="LiveDemoExampleLabel"
                >
                  <CModalHeader>
                    <CModalTitle id="LiveDemoExampleLabel">Registro de Mashguiach</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    {selectedStore}
                    <CForm>
                      <CCol md={3}>
                        <CFormLabel>Mashguiach:</CFormLabel>
                        <CFormSelect
                          value={mashguiachSelected}
                          onChange={(e) => setMashguiachSelected(e.target.value)}
                        >
                          <option key={0}>Selecione uma opção</option>
                          {mashguiachOptions.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol style={{ marginTop: '10px' }}>
                        <CFormInput
                          type="email"
                          label="Salário"
                          placeholder="R$"
                          text="Valor em Reais."
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                        />
                      </CCol>
                    </CForm>
                  </CModalBody>
                  <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>
                      Close
                    </CButton>
                    <CButton onClick={handleAddMashguiach} color="primary">
                      Salvar
                    </CButton>
                  </CModalFooter>
                </CModal>
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
