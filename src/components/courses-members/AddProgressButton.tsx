"use client"

import { checkClassWatched } from "@/app/_actions/courses-members/check-class-watched";
import { postNewProgress } from "@/app/_actions/courses-members/postNewProgress";
import { removeProgress } from "@/app/_actions/courses-members/removeProgress";
import { CButton } from "@coreui/react-pro";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AddProgressButtonProps = {
    lessonId: string,
    courseId: string
}

const AddProgressButton = ({ lessonId, courseId }: AddProgressButtonProps) => {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
    const router = useRouter();
    const [watchedClass, setWatchedClass] = useState(false);

    const checkIfClassIsWatched = async () => {
        if (userId) {
            const progress = await checkClassWatched({ userId, lessonId });
            setWatchedClass(!!progress);  // Define o estado com base no progresso existente
        }
    }

    useEffect(() => {
        // Chama a função apenas uma vez quando o componente for montado
        checkIfClassIsWatched();
    }, [userId, lessonId]);

    const handleProgressButton = async () => {
        if (userId) {
            await postNewProgress({ userId, courseId, lessonId });
            setWatchedClass(true);  // Define como assistida
            router.push(`/courses/${courseId}`);
        }
    }

    const handleRemoveProgressButton = async () => {
        if (userId) {
            await removeProgress({ userId, courseId, lessonId });
            setWatchedClass(false);  // Define como não assistida
        }
    }

    return (
        <>
            {watchedClass ? (
                <CButton
                    style={{ marginTop: '40px', marginBottom: '40px' }}
                    variant="outline"
                    color="danger"
                >
                    Marcada como assistida! 
                </CButton>
            ) : (
                <CButton
                    style={{ marginTop: '40px', marginBottom: '40px' }}
                    variant="outline"
                    color="success"
                    onClick={handleProgressButton}
                >
                    Marcar aula como assistida
                </CButton>
            )}
        </>
    );
}

export default AddProgressButton;
