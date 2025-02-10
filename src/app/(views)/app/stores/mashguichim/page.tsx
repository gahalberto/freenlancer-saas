'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import Link from 'next/link'
import ButtonCompo from '@/components/CButtonCom'
import { getStores } from '@/app/_actions/stores/getStores'
import { Stores, User } from '@prisma/client'
import { getStoreMashguichim } from '@/app/_actions/stores/getMashguichimToStore'
import { getAllMashguichim } from '@/app/_actions/getAllMashguichim'

const StoreMashguichimPage = () => {
  const { data: session, status } = useSession()
  const [storesList, setStoresList] = useState<Stores[]>([])
  const [mashguiachList, setMashguiachList] = useState<User[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [mashguiachSelected, setMashguiachSelected] = useState<string>('')
  const [storeSelected, setStoreSelect] = useState<string>('')
  const [mashguiachOptions, setMashguiachOptions] = useState<User[]>([])

  const fetchAllMashguichim = async () => {
    const response = await getAllMashguichim()
    if (response) {
      setMashguiachOptions(response)
    }
  }

  const fetchStores = async () => {
    if (status === 'authenticated') {
      const data = await getStores(session.user.id)
      setStoresList(data as any)
    }
  }

  const fetchMashguichim = async () => {
    if (storesList.length > 0) {
      const storesIds = storesList.map((store) => store.id)
      const data = await getStoreMashguichim(storesIds)
      setMashguiachList(data as any)
    }
  }

  useEffect(() => {
    fetchStores()
    fetchMashguichim()
    fetchAllMashguichim()
  }, [])

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (status === 'unauthenticated') {
    return <p>Você precisa estar logado para acessar esta página.</p>
  }

  return (
    <>
      <CButton
        style={{ marginBottom: '20px' }}
        size="lg"
        color="primary"
        onClick={() => setModalVisible(!modalVisible)}
      >
        Registrar Mashguiach ao estabelecimento
      </CButton>
      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Registro de Mashguiach</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CCol md={3}>
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
            </CCol>

            <CCol md={3} style={{ marginTop: '10px' }}>
              <CFormLabel>Estabelecimento:</CFormLabel>
              <CFormSelect value={storeSelected} onChange={(e) => setStoreSelect(e.target.value)}>
                {storesList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol style={{marginTop: '10px'}}>
              <CFormInput
                type="email"
                label="Salário"
                placeholder="R$"
                text="Valor em Reais."
                aria-describedby="exampleFormControlInputHelpInline"
              />
            </CCol>
            
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary">Save changes</CButton>
        </CModalFooter>
      </CModal>

      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <CCardTitle>Lista de Mashguiach Registrados</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CTable>
            <CTableBody>
              {mashguiachList.map((user, index) => (
                <CTableRow key={user.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{user.name}</CTableDataCell>
                  <CTableDataCell>
                    <Link href={`/app/stores/edit/${user.id}`}>Ver detalhes/Editar</Link>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default StoreMashguichimPage
