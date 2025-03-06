import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solicitar Exclusão de Conta | BYK - Beit Yaakov Kashrut',
  description: 'Solicite a exclusão da sua conta e dados pessoais do sistema BYK - Beit Yaakov Kashrut',
};

export default function ExcluirContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 