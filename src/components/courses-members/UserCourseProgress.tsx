import { getStudentProgress } from "@/app/_actions/courses-members/getStudentProgress";
import { CProgress, CProgressBar } from "@coreui/react-pro";
import { useEffect, useState } from "react";

type ProgressProps = {
    userId: string,
    courseId: string,
    lessonCount: number
}

export default function UserCourseProgress({ userId, courseId, lessonCount }: ProgressProps) {
    const [userProgress, setUserProgress] = useState(0);

    const fetchUserProgress = async () => {
        const progressPercentage = await getStudentProgress({ userId, courseId });
        setUserProgress(progressPercentage); // Atualiza o progresso com a porcentagem
    }

    useEffect(() => {
        fetchUserProgress();
    }, [userId, courseId]);

    return (
        <>
            <CProgress className="mb-3">
                <CProgressBar color="success" variant="striped" animated value={userProgress} />
            </CProgress>
            {/* <span>Seu progresso: {userProgress.toFixed(2)}%</span> */}
        </>
    );
}
