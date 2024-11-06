import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/app/_lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function POST(req: NextRequest) {
  const arrayBuffer = await req.arrayBuffer();
  const buf = Buffer.from(arrayBuffer); // Converte ArrayBuffer para Buffer
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Erro no webhook:', err.message);
    return NextResponse.json({ error: `Erro no Webhook: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits ?? '0', 10);

    if (userId && credits > 0) {
      try {
        await db.$transaction([
          db.user.update({
            where: { id: userId },
            data: {
              credits: {
                increment: credits,
              },
            },
          }),
          db.transaction.create({
            data: {
              userId,
              amount: session.amount_total ? session.amount_total / 100 : 0,
              credits,
              status: 'Pending',
            },
          }),
        ]);

        return NextResponse.json({ received: true });
      } catch (error) {
        console.error('Erro ao processar a transação:', error);
        return NextResponse.json({ error: 'Erro ao processar a transação' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Dados inválidos no webhook' }, { status: 400 });
    }
  }

  return NextResponse.json({ received: true });
}
