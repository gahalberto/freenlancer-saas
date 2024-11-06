"use server"
import { db } from "@/app/_lib/prisma";
import ModulesList from "@/components/courses-members/ModulesList";

type ParamsType = {
    params: {
        id: string
    }
}

export default async function ClassPage({params}: ParamsType){
    const CourseList = await db.course.findUnique({where: {id: params.id}});
    if (!CourseList) {
        return <div>Course not found</div>; // Renderize uma mensagem de erro ou redirecione, se necessário
    }

    return(
        <>
             <ModulesList Course={CourseList} />
        </>
    )
}