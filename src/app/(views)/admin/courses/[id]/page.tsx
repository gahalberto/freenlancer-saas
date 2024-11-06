import { db } from "@/app/_lib/prisma";
import CourseEditForm from "@/components/admin/courses/CourseEditForm";
import ModulesLists from "@/components/admin/courses/ModulesList";

interface ParamsProps {
    params: {
      id: string;
    };
  }
  
const EditCoursePage = async ({params}: ParamsProps) => {
   const courseDetails =  await db.course.findUnique({where: {id: params.id}})
   if(!courseDetails) return <><p>Curso não encontrado</p></>
    return(
        <>
            <CourseEditForm Course={courseDetails} />
            <ModulesLists Course={courseDetails} />
        </>
    )
}

export default EditCoursePage;