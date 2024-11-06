"use client"
import { getStudentProgress } from "@/app/_actions/courses-members/getStudentProgress";
import { getAllCourses } from "@/app/_actions/courses/getAllCourses";
import TopButtonsControl from "@/components/admin/courses/TopButtonsControl";
import UserCourseProgress from "@/components/courses-members/UserCourseProgress";
import { CCard, CCardBody, CCardFooter, CCardImage, CCardText, CCardTitle, CCol, CProgress, CProgressBar, CRow } from "@coreui/react-pro";
import { Course } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const CoursesPage = () => {
    const [coursesList, setCoursesList] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [studentProgress, setStudentProgress] = useState(0);

    const {data: session, status} = useSession();
    const userId = session?.user?.id;

    const fetchStudentProgress = async (courseId : string) => {
        if(userId){
            await getStudentProgress({userId, courseId})
        }
    }

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const courses = await getAllCourses();
                setCoursesList(courses);
                setLoading(false);
            } catch (error) {
                console.error({ error: "aconteceu algum erro" + error });
            }
        }
        fetchCourses();
        console.log(coursesList);
    }, []);
    return (
        <>
            <CRow xs={{ cols: 1, gutter: 4 }} md={{ cols: 2 }}>
                {coursesList.map(item => (
                    <CCol xs key={item.id}>
                        <CCard>
                            <CCardImage orientation="top" src={`${item.imageUrl}` || ''} />
                            <CCardBody>
                                <Link href={`/courses/${item.id}`}>
                                    <CCardTitle>{item.title}</CCardTitle>
                                </Link>
                                <CCardText>
                                    {item.description}
                                </CCardText>
                            </CCardBody>
                            <CCardFooter>
                            <small className="text-body-secondary">Seu progresso nesse curso:</small>
                                <UserCourseProgress userId={userId ? userId : ''} courseId={item.id} lessonCount={item.lessonCount ? item.lessonCount : 0} />
                            </CCardFooter>
                        </CCard>
                    </CCol>
                ))}
            </CRow>

        </>
    )
}

export default CoursesPage;