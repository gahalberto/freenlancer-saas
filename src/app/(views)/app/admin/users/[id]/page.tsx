import { db } from "@/app/_lib/prisma";
import UserEditForm from "@/components/users/UserEditForm";

interface ParamsProps {
  params: {
    id: string;
  };
}

export default async function UserInfo({ params }: ParamsProps) {
  // Busque os dados do usuário no servidor
  const userInfo = await db.user.findUnique({
    where: { id: params.id },
  });

  if (!userInfo) {
    return <p>Usuário não encontrado</p>;
  }

  // Passe os dados para o Client Component
  return <UserEditForm initialData={userInfo} />;
}
