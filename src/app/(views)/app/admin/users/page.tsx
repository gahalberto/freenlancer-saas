"use client"
import { makeAdmin } from "@/app/_actions/admin/makeAdmin"
import { getUsers } from "@/app/_actions/getUsers"
import { CAvatar, CBadge, CButton, CCardBody, CCollapse, CSmartTable } from "@coreui/react-pro"
import { MashguiachQuestions, User } from "@prisma/client"
import Link from "next/link"
import { useEffect, useState } from "react"

const Users = () => {
  const [details, setDetails] = useState<MashguiachQuestions[]>([])
  const [usersData, setUsersData] = useState<User[]>([]);

  const fetchUsers = async () => {
    const users = await getUsers();
    if (users) setUsersData(users);
  }



  useEffect(() => {
    fetchUsers();
    console.log(`Users: ${usersData}`);
  }, []);

  const columns = [
    {
      key: 'avatar',
      label: '',
      filter: false,
      sorter: false,
    },
    {
      key: 'name',
      label: 'Nome',
      _style: { width: '40%' },
    },

    {
      key: 'status',
      _style: { width: '20%' }
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
  const toggleDetails = (index: any) => {
    const position = details.indexOf(index)
    let newDetails = details.slice()
    if (position !== -1) {
      newDetails.splice(position, 1)
    } else {
      newDetails = [...details, index]
    }
    setDetails(newDetails)
  }

  const handleTornarAdmin = async (userId: string) => {
    await makeAdmin(userId)
  }

  return (
    <CSmartTable
      activePage={2}
      cleaner
      clickableRows
      columns={columns}
      columnFilter
      columnSorter
      footer
      items={usersData}
      itemsPerPageSelect
      itemsPerPage={5}
      pagination
      onFilteredItemsChange={(items) => {
        console.log(items)
      }}
      onSelectedItemsChange={(items) => {
        console.log(items)
      }}
      scopedColumns={{
        avatar: (item: any) => (
          <td>
            <CAvatar src={`/images/avatars/avatar.jpg`} />
          </td>
        ),
        show_details: (item: any) => {
          return (
            <td className="py-2">
              <CButton
                color="primary"
                variant="outline"
                shape="square"
                size="sm"
                onClick={() => {
                  toggleDetails(item.id)
                }}
              >
                {details.includes(item.id) ? 'Esconder' : 'Mostrar'}
              </CButton>
            </td>
          )
        },
        details: (item) => {
          return (
            <CCollapse visible={details.includes(item.id)}>
              <CCardBody className="p-3">
                <h4>{item.name}</h4>
                <p className="text-muted">Endereço: {item.address}</p>
                <CButton className="m-1" size="sm" color="info" href={`./users/${item.id}`}>
                  Editar Usuário
                </CButton>
                <CButton size="sm" color="success" className="m-1">
                  <Link className="text-white no-underline !underline-none" href={`https://wa.me/${item.phone}`}>
                    Chamar no Whatsapp
                  </Link>

                </CButton>

                {/* <CButton size="sm" color="danger" onClick={() => desativarUser(item.id)} className="m-1">
                  Desativar Usuário
                </CButton> */}

                <CButton size="sm" onClick={() => handleTornarAdmin(item.id)} color="dark" className="m-1">
                  TORNAR ADMIN
                </CButton>

              </CCardBody>
            </CCollapse>
          )
        },
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
        className: 'align-middle'
      }}
    />
  )
}

export default Users;


