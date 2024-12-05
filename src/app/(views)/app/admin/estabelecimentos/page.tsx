"use client"
import { getEstabelecimentos } from "@/app/_actions/getEstabelecimentos"
import { CAvatar, CBadge, CButton, CCardBody, CCollapse, CSmartTable } from "@coreui/react-pro"
import Link from "next/link"
import { useEffect, useState } from "react"

const Estabelecimentos = () => {
    const [details, setDetails] = useState<number[]>([]);
    const [storeData, setStoreData] = useState([]);

    useEffect(() => {
        const fetchEstabelecimentos = async () => {
            const estabelecimentos = await getEstabelecimentos();
            if(estabelecimentos) setStoreData(estabelecimentos as any);
        }

        fetchEstabelecimentos();
        console.log(`Users: ${storeData}`);
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
    ];

    const getBadge = (status: string) => {
      switch (status) {
        case 'Active':
          return 'success';
        case 'Inactive':
          return 'secondary';
        case 'Pending':
          return 'warning';
        case 'Banned':
          return 'danger';
        default:
          return 'primary';
      }
    };

    const toggleDetails = (index: number) => {
      const position = details.indexOf(index);
      let newDetails = [...details];
      if (position !== -1) {
        newDetails.splice(position, 1);
      } else {
        newDetails.push(index);
      }
      setDetails(newDetails);
    };

    return (
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
            <td>
              {item.status && (
                <CBadge color={getBadge(item.status)}>{item.status}</CBadge>
              )}
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
                <h4>{item.name}</h4>
                <p className="text-muted">Endereço: {item.address}</p>
                <CButton className="m-1" size="sm" color="info">
                  Editar Usuário
                </CButton>
                <CButton size="sm" color="success" className="m-1">
                  <Link className="text-white no-underline" href={`https://wa.me/${item.phone}`}>
                    Chamar no Whatsapp
                  </Link>
                </CButton>
                <CButton size="sm" color="danger" className="m-1">
                  Desativar
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
          className: 'align-middle'
        }}
      />
    );
};

export default Estabelecimentos;
