"use client"
import { getQuestionarioList } from "@/app/_actions/getQuestionarioList"
import { getUsers } from "@/app/_actions/getUsers"
import { CAvatar, CBadge, CButton, CCardBody, CCollapse, CSmartTable } from "@coreui/react-pro"
import { MashguiachQuestions, User } from "@prisma/client"
import { useEffect, useState } from "react"

const estadoCivil = (n: number) => {
    switch (n) {
        case 1:
            return 'Solteiro(a)'
            break;
        case 2:
            return 'Casado(a)'
            break;
        case 3:
            return 'Divorciado(a)'
            break;
        case 4:
            return 'Viuvo(a)'
            break;
        default:
            break;
    }
}

const QuestionarioList = () => {
    const [details, setDetails] = useState<MashguiachQuestions []>([])
    const [usersData, setUsersData] = useState<User []>([]);

    useEffect(() => {
        const fetchUsers = async () => {
          const lista = await getQuestionarioList();
          if (lista) {
            // Processa os dados para incluir o campo 'nome'
            const processedData = lista.map(item => ({
              ...item,
              nome: item.user.name, // Adiciona o campo 'nome' diretamente
            }));
            setUsersData(processedData as any);
          }
        };
      
        fetchUsers();
      }, []);
      
    const columns = [
        {
            key: 'avatar',
            label: '',
            filter: false,
            sorter: false,
        },
        {
            key: 'nome',
            label: 'Nome',
            _style: { width: '40%' },
        },
        {
            key: 'nomejudaico',
            label: 'Nome Judaico',
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
                nome: (item: any) => (
                    <td>
                        {item.user.name}
                    </td>
                ),
                nomejudaico: (item: any) => (
                    <td>
                        {item.jewishName}
                    </td>
                ),
                status: (item: any) => (
                    <td>
                        {item.status && (
                            <CBadge color="success">Ativo</CBadge>
                        )}
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
                                <h4>{item.user.name} - {item.jewishName}</h4>
                                <p className="text-muted">Estado Cívil: {estadoCivil(item.maritalStatus)}</p>
                                <p className="text-muted">Rabino: {item.rabbi}</p>
                                <p className="text-muted">Esposa(o): {item.wifeName}</p>
                                <p className="text-muted">Local do Casamento: {item.weddingLocation}</p>
                                <p className="text-muted">Rabino que casou: {item.rabbiMarried}</p>
                                <p className="text-muted">Sinagoga que frequenta: {item.currentSynagogue}</p>
                                <p className="text-muted">Participe de Shiurim?: {item.shiur}</p>
                                <p className="text-muted">Reza: {item.daven}</p>
                                <CButton size="sm" color="info">
                                    Visualizar Informações do Usuário
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

export default QuestionarioList;


