import { z } from 'zod';
import { insertUserSchema, insertWithdrawalSchema, users, withdrawals } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalWithdrawals: z.number(),
          totalBalance: z.number(),
        }),
      },
    },
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users',
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect>()),
        },
      },
    },
    withdrawals: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/withdrawals',
        responses: {
          200: z.array(z.custom<typeof withdrawals.$inferSelect & { user: typeof users.$inferSelect }>()),
        },
      },
      updateStatus: {
        method: 'PATCH' as const,
        path: '/api/admin/withdrawals/:id/status',
        input: z.object({
          status: z.enum(['pending', 'processing', 'completed', 'rejected']),
        }),
        responses: {
          200: z.custom<typeof withdrawals.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
