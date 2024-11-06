"use client";
import { deleteLesson } from "@/app/_actions/courses/deleteLesson";
import { getAllLessons } from "@/app/_actions/courses/getAllLessons";
import {
    CButton,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHeaderCell,
    CTableRow,
} from "@coreui/react-pro";
import { Lesson } from "@prisma/client";
import { useEffect, useState } from "react";
import LessonEditModal from "./LessonEditModal";

interface LessonsTableListProps {
    moduleId: string;
}

export const LessonsTableList = ({ moduleId }: LessonsTableListProps) => {
    const [lessonsList, setLessonsList] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLessons = async () => {
        try {
            const lessons = await getAllLessons(moduleId);
            if (lessons) setLessonsList(lessons);
        } catch (error) {
            console.error("Erro ao buscar aulas:", error);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, [moduleId]);

    const handleDeletingLesson = async (lessonId: string) => {
        try {
            if (confirm("Tem certeza que deseja excluir essa aula?")) {
                await deleteLesson(lessonId);
                fetchLessons();
            }
        } catch (error) {
            console.error("Erro ao excluir aula:", error);
        }
    };

    const handleEditingLesson = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLesson(null);
    };

    return (
        <>
            <CTable>
                <CTableBody>
                    {lessonsList.length > 0 ? (
                        lessonsList.map((lesson, index) => (
                            <CTableRow key={lesson.id}>
                                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                <CTableDataCell>{lesson.title}</CTableDataCell>
                                <CTableDataCell className="text-end">
                                    <CButton
                                        color="info"
                                        variant="outline"
                                        shape="square"
                                        size="sm"
                                        onClick={() => handleEditingLesson(lesson)}
                                    >
                                        Editar
                                    </CButton>
                                    <CButton
                                        color="danger"
                                        variant="outline"
                                        shape="square"
                                        size="sm"
                                        onClick={() => handleDeletingLesson(lesson.id)}
                                    >
                                        Excluir
                                    </CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))
                    ) : (
                        <CTableRow>
                            <CTableDataCell colSpan={3} className="text-center">
                                Esse módulo ainda não tem aula!
                            </CTableDataCell>
                        </CTableRow>
                    )}
                </CTableBody>
            </CTable>

            {selectedLesson && (
                <LessonEditModal
                    lesson={selectedLesson}  // Corrija 'Lesson' para 'lesson'
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    fetchLessons={() => fetchLessons()}
                />
            )}
        </>
    );
};

export default LessonsTableList;
