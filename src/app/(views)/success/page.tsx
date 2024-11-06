"use client"; // Importante para habilitar o uso de hooks do lado do cliente

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams?.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [hasVerified, setHasVerified] = useState(false); // Novo estado para controlar duplicidade

  useEffect(() => {
    const verifyPayment = async () => {
      // Verificar se já foi verificado para evitar duplicidade
      if (!session_id || hasVerified) {
        setError("session_id não encontrado na URL ou já verificado.");
        setLoading(false);
        return;
      }

      try {
        console.log("Verificando pagamento para session_id:", session_id);
  
        const response = await fetch(`/api/verify-payment?session_id=${session_id}`);
  
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Resposta da verificação de pagamento:", data);
  
        setPaymentStatus(data.paymentStatus);

        // Evitar chamada duplicada
        setHasVerified(true);

        if (data.paymentStatus === "Paid") {
          router.push("/credits");
        } else if (data.paymentStatus === "Pending") {
          setError("O pagamento ainda está pendente.");
        } else {
          setError("Status de pagamento desconhecido.");
        }
      } catch (error: unknown) {
        console.error("Erro ao verificar o pagamento:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Erro desconhecido ao verificar o pagamento.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [session_id, router, hasVerified]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-red-600 text-2xl font-bold">Erro:</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        {paymentStatus === "Paid" ? "Pagamento confirmado!" : "Processando pagamento..."}
      </h1>
      {paymentStatus === "Pending" && (
        <p className="text-yellow-500">Seu pagamento está pendente. Por favor, aguarde mais alguns minutos.</p>
      )}
    </div>
  );
};

// Suspense wrapper
const Success = () => {
  return (
    <Suspense fallback={<div>Carregando dados do pagamento...</div>}>
      <SuccessContent />
    </Suspense>
  );
};

export default Success;
