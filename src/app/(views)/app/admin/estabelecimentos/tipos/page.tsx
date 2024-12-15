'use client'
import { deleteType } from '@/app/_actions/stores/createType'
import { getStoresTypes } from '@/app/_actions/stores/getStoresType'
import StoreTypeModalForm from '@/components/stores/newStoreType'
import { cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { StoresType } from '@prisma/client'
import { useEffect, useState } from 'react'

const StoresTypesPage = () => {
  const [types, setTypes] = useState<StoresType[]>([])
  const fetchTypes = async () => {
    const types = await getStoresTypes()
    if (types) setTypes(types as any)
  }

  const onClose = () => {
    fetchTypes()
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  function handleDeleteBtn(id: string) {
    if (confirm('Deseja realmente excluir este tipo de estabelecimento?')) {
      deleteType(id)
      fetchTypes()
    }
  }

  return (
    <CCard>
      <CCardHeader>
        Tipos de estabelecimentos <StoreTypeModalForm onClose={onClose} />
      </CCardHeader>
      <CCardBody>
        <CTable>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Título</CTableHeaderCell>
              <CTableHeaderCell scope="col">Açoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {types.map((type, index) => (
              <CTableRow key={index}>
                <CTableHeaderCell scope="row">{index}</CTableHeaderCell>
                <CTableDataCell>{type.title}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="danger" size="sm" onClick={() => handleDeleteBtn(type.id)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default StoresTypesPage
