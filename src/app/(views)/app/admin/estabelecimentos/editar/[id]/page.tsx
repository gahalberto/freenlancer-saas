import { db } from "@/app/_lib/prisma";
import EstabelecimentoEditForm from "@/components/users/EstabelecimentoEditForm";

interface ParamsProps {
  params: {
    id: string;
  };
}

export default async function EstabelecimentoEditPage({ params }: ParamsProps) {
  // Busque os dados do usuário no servidor
  const userInfo = await db.stores.findUnique({
    where: { id: params.id },
    select: {
        id: true,
        title: true,
    },
  });

  if (!userInfo) {
    return <p>Usuário não encontrado</p>;
  }

  // Passe os dados para o Client Component
  return <EstabelecimentoEditForm initialData={userInfo} />;
}
