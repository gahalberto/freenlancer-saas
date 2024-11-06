import { useEffect, useState } from "react";
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
import Link from "next/link";

interface LessonsTableListProps {
    moduleId: string;
}

// Tipo que inclui a propriedade watched
interface LessonWithProgress extends Lesson {
    watched: boolean;
}

export const LessonsTableList = ({ moduleId }: LessonsTableListProps) => {
    const [lessonsList, setLessonsList] = useState<LessonWithProgress[]>([]);

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

    return (
        <>
            <CTable>
                <CTableBody>
                    {lessonsList.length > 0 ? (
                        lessonsList.map((lesson, index) => (
                            <CTableRow key={lesson.id}>
                                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                <CTableDataCell>
                                    <Link href={`/courses/lessons/${lesson.id}`}>
                                        {lesson.title}
                                    </Link>
                                </CTableDataCell>
                                <CTableDataCell className="text-end">
                                    <Link href={`/courses/lessons/${lesson.id}`}>
                                        <CButton
                                            color={lesson.watched ? "success" : "info"}
                                            variant="outline"
                                            shape="square"
                                            size="sm"
                                        >
                                            {lesson.watched ? "Assistida" : "Não Assistida"}
                                        </CButton>
                                    </Link>
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
        </>
    );
};

export default LessonsTableList;
