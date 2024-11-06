"use client";
import { getModulesById } from "@/app/_actions/courses/getAllModules";
import { CButton, CCard, CCardBody, CCardHeader, CCol, CCollapse, CRow, CSmartTable } from "@coreui/react-pro";
import { useEffect, useState } from "react";
import ModalCreateModules from "./ModalCreateModules";
import { Course } from "@prisma/client";
import LessonsTableList from "./LessonsTableList";
import { deleteModule } from "@/app/_actions/courses/deleteModule";
import CreateLessonModal from "./CreateLessonModal";

interface CourseItemsProps {
    Course: Course;
}

const ModulesList = ({ Course }: CourseItemsProps) => {
    const [details, setDetails] = useState<string[]>([]);
    const [modulesList, setModulesList] = useState<any[]>([]);

    const columns = [
        {
            key: 'title',
            label: 'Título',
            _style: { width: '70%' },
        },
        {
            key: 'show_details',
            label: '',
            _style: { width: '30%' },
            filter: false,
            sorter: false,
        },
    ];

    const toggleDetails = (index: string) => {
        const position = details.indexOf(index);
        let newDetails = details.slice();
        if (position !== -1) {
            newDetails.splice(position, 1);
        } else {
            newDetails = [...details, index];
        }
        setDetails(newDetails);
    };

    const courseId = Course.id;

    const fetchModules = async () => {
        try {
            const modules = await getModulesById(courseId);
            if (modules) setModulesList(modules);
        } catch (error) {
            console.error("Erro ao buscar módulos:", error);
        }
    };

    useEffect(() => {
        fetchModules();
    }, []);

    const handleDeletingModule = async (id: string) => {
        if (confirm('Tem certeza que deseja deletar esse módulo?')) {
            await deleteModule(id);
            fetchModules(); // Atualiza a lista de módulos após a exclusão
        }
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <strong>Módulos & Aulas</strong>
                            <ModalCreateModules courseId={Course.id} fetchModules={fetchModules} /> {/* Passa courseId como prop */}
                        </CCardHeader>
                        <CCardBody>
                            <CSmartTable
                                activePage={2}
                                clickableRows
                                columns={columns}
                                footer
                                items={modulesList}
                                itemsPerPageSelect
                                itemsPerPage={5}
                                pagination
                                scopedColumns={{
                                    show_details: (item: any) => {
                                        return (
                                            <td className="flex py-3">
                                                <CButton
                                                    className="mx-2"
                                                    color="primary"
                                                    variant="outline"
                                                    shape="square"
                                                    size="sm"
                                                    onClick={() => {
                                                        toggleDetails(item.id);
                                                    }}
                                                >
                                                    {details.includes(item.id) ? 'Esconder' : 'Mostrar'}
                                                </CButton>

                                                <CreateLessonModal courseId={Course.id} moduleId={item.id} fetchModules={() => fetchModules()} />

                                                <CButton
                                                    color="danger"
                                                    variant="outline"
                                                    shape="square"
                                                    size="sm"
                                                    onClick={() => {
                                                        handleDeletingModule(item.id);
                                                    }}
                                                >
                                                    Excluir
                                                </CButton>
                                            </td>
                                        );
                                    },
                                    details: (item: any) => {
                                        return (
                                            <CCollapse visible={details.includes(item.id)}>
                                                <LessonsTableList moduleId={item.id} />
                                            </CCollapse>
                                        );
                                    },
                                }}
                                sorterValue={{ column: 'title', state: 'asc' }}
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
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    );
};

export default ModulesList;
