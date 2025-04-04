import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

// Define o esquema de entrada
const problemReportSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().optional(),
  screenshotUrl: z.string().optional(),
});

export const problemReportRouter = createTRPCRouter({
  create: protectedProcedure
    .input(problemReportSchema)
    .mutation(({ctx, input}) => {
      return ctx.prisma.problemReport.create({
        data: {
          userId: input.userId,
          title: input.title,
          description: input.description,
          url: input.url,
          screenshotUrl: input.screenshotUrl,
        },
      });
    }),

  getAll: protectedProcedure.query(({ctx}) => {
    return ctx.prisma.problemReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }),
}); 