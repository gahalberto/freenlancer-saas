import { NextApiRequest, NextApiResponse } from 'next';
import stripe from '@/app/_lib/stripe';
import { db } from '@/app/_lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: 'session_id não fornecido' });
  }

  try {
    // Recuperar a sessão de pagamento do Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id as string);

    // Verificar se a sessão tem metadata com orderId
    // Verificar se a sessão contém metadados, incluindo o userId
    if (!session.metadata || !session.metadata.userId) {
      return res.status(400).json({ error: 'Metadata do usuário não encontrado na sessão' });
    }
    // Obter o valor total da sessão e tratar se for null
    const amountTotal = session.amount_total !== null ? session.amount_total / 100 : 0;

    // Verificar o status do pagamento no Stripe
    let paymentStatus;
    if (session.payment_status === 'paid') {
      paymentStatus = 'Paid';

      const transactionExists = await db.transaction.findUnique({
        where: { sessionId: session_id as string }
      });

      if (transactionExists) {
        // Se a transação já foi registrada, retorne imediatamente
        return res.status(200).json({ message: "Transação já processada" });
      }


      // Registrar a transação no banco de dados
      await db.transaction.create({
        data: {
          userId: session.metadata.userId,
          amount: amountTotal, // Usar o valor tratado
          credits: amountTotal, // Usar o valor tratado
          status: 'Success',
          sessionId: session_id as string
        },
      });

      await db.user.update({
        where: {
          id: session.metadata.userId,
        },
        data: {
          credits: {
            increment: amountTotal // Somar amountTotal aos créditos existentes
          }
        }
      })

    } else if (session.payment_status === 'unpaid' || session.payment_status === 'no_payment_required') {
      paymentStatus = 'Pending';
    } else if (session.payment_status === 'pending') {
      paymentStatus = 'Pending';
    } else {
      paymentStatus = 'Failed';

      // Registrar a transação como "Failed"
      await db.transaction.create({
        data: {
          userId: session.metadata.userId,
          amount: amountTotal, // Usar o valor tratado
          credits: amountTotal, // Usar o valor tratado
          status: 'Failed',
          sessionId: session_id as string
        },
      });
    }

    // Responder com o status do pagamento
    return res.status(200).json({ paymentStatus });

  } catch (err) {
    console.error('Erro ao verificar pagamento:', err);
    return res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
}
