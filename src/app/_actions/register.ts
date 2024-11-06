"use server";

import { db } from "../_lib/prisma";
import bcrypt from "bcryptjs";

export const registerUser = async (data: { name: string; email: string; password: string, phone: string, address: string, roleId: string}) => {
  // Criptografar a senha antes de salvar
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Este e-mail já está em uso.");
  } else {
    await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        password: hashedPassword, // Armazena a senha criptografada
        roleId: parseInt(data.roleId)
      },
    });  
  }

};
