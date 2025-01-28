import { z } from "zod";

export const esatebelcimentoSchema = z.object({
  id: z.string(),  // Inclua o campo id
  title: z.string().min(1, "Nome é obrigatório"),
});

export type EstabelecimentoFormData = z.infer<typeof esatebelcimentoSchema>;
