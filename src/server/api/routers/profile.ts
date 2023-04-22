import { clerkClient } from '@clerk/nextjs/server';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import z from 'zod';

import { TRPCError } from '@trpc/server';

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });
      if (!user?.username) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      const { id, username, profileImageUrl } = user;

      return { id, username, profileImageUrl };
    }),
});
