import { clerkClient } from '@clerk/nextjs/server';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import z from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { TRPCError } from '@trpc/server';
import { buildPosts, emojiValidator } from '~/utils/post';
import { buildPublicProfile } from '~/utils/profile';

// Create a new ratelimiter, that allows 1 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: '@upstash/ratelimit',
});

const MAX_POSTS = 100;

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      where: { authorId: { not: '' }, isActive: true },
      orderBy: [{ createdAt: 'desc' }],
      take: MAX_POSTS,
    });

    const users = await clerkClient.users.getUserList({
      userId: posts.map(({ authorId }) => authorId),
      limit: MAX_POSTS,
    });

    return buildPosts(posts, users);
  }),

  create: privateProcedure
    .input(
      z.object({
        content: emojiValidator,
      })
    )
    .mutation(async ({ ctx, input: { content } }) => {
      const { userId: authorId } = ctx;

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content,
        },
      });
      return post;
    }),
  getById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const postId = input.postId;
      const post = await ctx.prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      const [user] = await clerkClient.users.getUserList({
        userId: [post.authorId],
      });
      const author = buildPublicProfile(user);
      if (!author) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return { ...post, author };
    }),
  getByAuthorId: publicProcedure
    .input(
      z.object({
        authorId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const authorId = input.authorId;
      const posts = await ctx.prisma.post.findMany({
        where: { authorId, isActive: true },
        orderBy: [{ createdAt: 'desc' }],
      });
      return posts;
    }),
  deleteById: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { postId } }) => {
      const { userId } = ctx;
      const post = await ctx.prisma.post.findUnique({ where: { id: postId } });
      if (!post) throw new TRPCError({ code: 'NOT_FOUND' });

      const isAuthor = userId === post.authorId;
      if (!isAuthor) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return ctx.prisma.post.update({
        data: { isActive: false },
        where: { id: postId },
      });
    }),
});
