import { type User } from '@clerk/nextjs/dist/api';
import { clerkClient } from '@clerk/nextjs/server';
import { type Post } from '@prisma/client';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

const MAX_POSTS = 100;

interface PublicUser {
  id: string;
  username: string | null;
  email?: string;
  profileImageUrl: string;
  textId: string;
}
interface UsersById {
  [key: string]: PublicUser;
}

type PostWithAuthor = Post & {
  author: PublicUser;
};

// const sleep = (n: number) => new Promise((res) => setTimeout(res, n));

const buildPosts = (posts: Post[], users: User[]) => {
  const usersById = users.reduce(
    (acc, { id, username, profileImageUrl, emailAddresses }) => {
      const email = emailAddresses[0]?.emailAddress;
      const textId = username ? `@${username}` : email;
      if (!textId) return acc;
      const usrObj: PublicUser = {
        id,
        username,
        profileImageUrl,
        email,
        textId,
      };
      return { ...acc, [id]: usrObj };
    },
    {} as UsersById
  );

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
      take: MAX_POSTS,
    });

    const users = await clerkClient.users.getUserList({
      userId: posts.map(({ authorId }) => authorId),
      limit: MAX_POSTS,
    });

    return buildPosts(posts, users);
  }),
});
