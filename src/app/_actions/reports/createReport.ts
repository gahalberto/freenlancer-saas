    "use server";

    import { db } from "@/app/_lib/prisma";

    export const createReport = async (formData: FormData) => {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const store = formData.get('store') as string;
        const imageFile = formData.get('image') as File | null;

        // Aqui você pode salvar a imagem no sistema de arquivos ou em algum serviço de armazenamento (como AWS S3)
        let imageUrl = ''; // Por exemplo, aqui você adicionaria a URL da imagem salva.

        // Caso queira simular um upload, pode usar uma URL de placeholder por enquanto.
        if (imageFile) {
            imageUrl = '/path/to/uploaded/image.jpg'; // Exemplo
        }

        // Criando o relatório no banco de dados
        return await db.reports.create({
            data: {
                title,
                description,
                storeId: 
                store,
                imageUrl, // URL da imagem que foi enviada
            },
        });
    };
