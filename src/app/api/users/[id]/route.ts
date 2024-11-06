import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await db.user.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const updatedUser = await db.user.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updatedUser);
}
