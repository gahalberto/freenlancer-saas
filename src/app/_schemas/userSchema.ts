import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),  // Inclua o campo id
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().nullable().optional(),  // Aceita string ou null
});

export type UserFormData = z.infer<typeof userSchema>;
