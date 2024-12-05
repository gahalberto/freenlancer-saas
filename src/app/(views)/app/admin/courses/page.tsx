'use client'
import Loading from '@/app/(views)/loading'
import { getAllCourses } from '@/app/_actions/courses/getAllCourses'
import TopButtonsControl from '@/components/admin/courses/TopButtonsControl'
import { CCard, CCardBody, CCardFooter, CCardText, CCardTitle, CCol, CRow } from '@coreui/react-pro'
import { Course } from '@prisma/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const Cursos = () => {
  const [coursesList, setCoursesList] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const courses = await getAllCourses()
        setCoursesList(courses)
      } catch (error) {
        console.error({ error: 'aconteceu algum erro: ' + error })
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, []) // Somente o array vazio nas dependências, para buscar uma vez ao montar

  if (loading) return <Loading />

  return (
    <>
      <div className="m-3">
        <TopButtonsControl />
      </div>
      <CRow xs={{ cols: 1, gutter: 4 }} md={{ cols: 2 }}>
        {coursesList.map((item) => (
          <CCol xs key={item.id}>
            <CCard>
              <CCardBody>
                <Link href={`/admin/courses/${item.id}`}>
                  <CCardTitle>{item.title}</CCardTitle>
                </Link>
                <CCardText>{item.description}</CCardText>
              </CCardBody>
              <CCardFooter>
                <small className="text-body-secondary">
                  {item.createdAt.toLocaleDateString()} - {item.instructor}
                </small>
              </CCardFooter>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </>
  )
}

export default Cursos
