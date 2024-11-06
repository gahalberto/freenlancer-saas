"use client"
import { useEffect, useState } from 'react'
import { loadStripe } from "@stripe/stripe-js";
import { getCreditsByUser } from '@/app/_actions/getCreditsByUser';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCardText, CCardTitle, CFormInput, CInputGroup, CInputGroupText } from '@coreui/react-pro';
import { useSession } from "next-auth/react";

// Carrega a chave pública do Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const AddCredits = () => {
  const [credits, setCredits] = useState(100); // Valor inicial de créditos
  const [userCredits, setUserCredits] = useState(100); // Valor inicial de créditos
  const { data: session, status } = useSession();  // Pegue a sessão do NextAuth
  const userId = session?.user?.id; // Pegue o userId da sessão (ajuste de acordo com a sua configuração)

  const handleAddCredits = async () => {
    if (!userId) {
      console.error("Usuário não autenticado.");
      return;
    }

    const stripe = await stripePromise;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credits, userId }),
    });

    const session = await response.json();


    if (stripe) {
      // Redireciona para o Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error.message);
      }

    }

  }

  useEffect(() => {
    const fetchCredits = async () => {
      const response = await getCreditsByUser();
      if (response) {
        setUserCredits(response.credits);
      }
    }

    fetchCredits();
  }, []);

  return (
    <div>
      <CCard color='success' textColor='white'>
        <CCardHeader>Sua carteira:</CCardHeader>
        <CCardBody>
          <CCardTitle className='text-black'>
            Você tem: <b>R$ {userCredits}</b> disponíveis na sua carteira
          </CCardTitle>
          <CCardText>
          </CCardText>
        </CCardBody>
      </CCard>

      <CCard className="text-center" style={{ marginTop: '20px' }}>
        <CCardHeader>Adicionar créditos</CCardHeader>
        <CCardBody>
          <CCardText>Escolha o valor que você quer inserir, ao clicar em Adicionar Créditos, você será redirecionado para finalizar o pagamento pelo Stripe.</CCardText>
          <CInputGroup className="mb-3">
            <CInputGroupText>R$</CInputGroupText>
            <CFormInput
              value={credits} onChange={(e) => setCredits(Number(e.target.value))}
              aria-label="Amount (to the nearest dollar)" />
            <CInputGroupText>.00</CInputGroupText>
            <CButton
              onClick={handleAddCredits}
              style={{ marginLeft: '10px' }} color="primary" href="#">Adicionar Créditos</CButton>
          </CInputGroup>
        </CCardBody>
        <CCardFooter className="text-body-secondary">2 days ago</CCardFooter>
      </CCard>
    </div>
  );
}

export default AddCredits;
