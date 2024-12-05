import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { db } from "@/app/_lib/prisma";
import AddProgressButton from '@/components/courses-members/AddProgressButton';

type ParamsPropsType = {
    params: {
        id: string;
    };
};

export default async function LessonPage({ params }: ParamsPropsType) {
    const lesson = await db.lesson.findUnique({
        where: {
            id: params.id,
        },
    });

    let sanitizedContent = '';

    if (lesson?.textContent) {
        // Crie um ambiente JSDOM para usar com DOMPurify no servidor
        const window = new JSDOM('').window;
        const purify = DOMPurify(window);
        sanitizedContent = purify.sanitize(lesson.textContent);
    }

    let embedUrl = '';

    if (lesson?.contentUrl) {
        embedUrl = lesson.contentUrl.replace('watch?v=', 'embed/');
    }

    return (
        <>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>{lesson?.title}</h3>
            {embedUrl ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                        src={embedUrl}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                        }}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ) : (
                <p>Vídeo não disponível.</p>
            )}

            <div style={{ marginTop: '40px', marginBottom: '40px' }}
             dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            
            <AddProgressButton lessonId={lesson?.id ? lesson?.id : ''} courseId={lesson?.courseId ? lesson?.courseId : ''} />
        </>
    );
}
