import { type User } from '@clerk/nextjs/dist/api';
import { clerkClient } from '@clerk/nextjs/server';
import { type Post } from '@prisma/client';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import z from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { TRPCError } from '@trpc/server';
import { emojiValidator } from '~/utils/post';

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

interface PublicUser {
  id: string;
  username: string;
  profileImageUrl: string;
}
interface UsersById {
  [key: string]: PublicUser;
}

type PostWithAuthor = Post & {
  author: PublicUser;
};

const buildPosts = (posts: Post[], users: User[]) => {
  const usersById = users.reduce((acc, { id, username, profileImageUrl }) => {
    if (!username) return acc;
    return { ...acc, [id]: { id, username: username, profileImageUrl } };
  }, {} as UsersById);

  return posts.reduce((acc, post) => {
    const author = usersById[post.authorId];
    return !author ? acc : [...acc, { ...post, author }];
  }, [] as PostWithAuthor[]);
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      where: {
        authorId: {
          not: '',
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
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
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
});
