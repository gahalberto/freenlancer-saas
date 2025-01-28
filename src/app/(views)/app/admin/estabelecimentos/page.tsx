'use client'
import { getAllStores } from '@/app/_actions/stores/getAllStores'
import CertificateModal from '@/components/admin/estabelecimentos/certificationModal'
import CertificationForm from '@/components/admin/estabelecimentos/CreateCertificationForm'
import { CAvatar, CBadge, CButton, CCardBody, CCollapse, CSmartTable } from '@coreui/react-pro'
import { Certifications } from '@prisma/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const Estabelecimentos = () => {
  const [details, setDetails] = useState<number[]>([])
  const [storeData, setStoreData] = useState([])
  const [certificateVisible, setCertificateVisible] = useState(false)
  const [certificateSelected, setCertificateSelected] = useState('')

  const fetchEstabelecimentos = async () => {
    const estabelecimentos = await getAllStores()
    if (estabelecimentos) setStoreData(estabelecimentos as any)
  }

  useEffect(() => {
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
      key: 'status',
      _style: { width: '20%' },
    },
    {
      key: 'show_details',
      label: '',
      _style: { width: '1%' },
      filter: false,
      sorter: false,
    },
  ]

  const getBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Inactive':
        return 'secondary'
      case 'Pending':
        return 'warning'
      case 'Banned':
        return 'danger'
      default:
        return 'primary'
    }
  }

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
          status: (item: any) => (
            <td>{item.status && <CBadge color={getBadge(item.status)}>{item.status}</CBadge>}</td>
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
                <h4>{item.title}</h4>
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
                  Mashguiach fixo:
                  {item.isMashguiach ? <b> Sim</b> : <b>: Não</b>}
                </p>
                <p className="text-muted">
                  Certificados:
                  {item.Certifications &&
                    item.Certifications.map((certification: any, index: number) => (
                      <CButton
                        key={index}
                        color="dark"
                        onClick={() => handleShowCertificate(certification)}
                      >
                        {certification.title || `Certificado ${index + 1}`}
                      </CButton>
                    ))}
                </p>

                <CButton className="m-1" size="sm" color="info" href={`./estabelecimentos/editar/${item.id}`}>
                  Editar
                </CButton>
                <CButton size="sm" color="primary" className="m-1">
                  <Link className="text-white no-underline" href={`https://wa.me/${item.phone}`}>
                    Chamar no Whatsapp
                  </Link>
                </CButton>
                <CButton size="sm" color="primary" className="m-1">
                  Desativar
                </CButton>
                <CButton
                  size="sm"
                  color="primary"
                  className="m-1"
                  onClick={() => handleCertificationAddButton(item.id)}
                >
                  Adicionar Certificado
                </CButton>
              </CCardBody>
            </CCollapse>
          ),
        }}
        selectable
        sorterValue={{ column: 'status', state: 'asc' }}
        tableFilter
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
