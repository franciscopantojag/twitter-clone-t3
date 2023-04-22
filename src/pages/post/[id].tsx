import { createServerSideHelpers } from '@trpc/react-query/server';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import superjson from 'superjson';
import PostView from '~/components/PostView';
import { appRouter } from '~/server/api/root';
import { api } from '~/utils/api';
import { prisma } from '../../server/db';

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking', // can also be true or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const postId = ctx.params?.id;
  if (typeof postId !== 'string') throw new Error('no slug');
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  await ssg.post.getById.prefetch({ postId });

  return {
    props: {
      postId,
      trpcState: ssg.dehydrate(),
    },
  };
};
const SinglePostView = ({ postId }: { postId: string }) => {
  const { data: post } = api.post.getById.useQuery({ postId });
  if (!post) return <div>Error...</div>;

  return (
    <>
      <Head>
        <title>{`${post.content} - @${post.author.username}`}</title>
      </Head>
      <main className="flex min-h-screen justify-center">
        <div className="flex min-h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
          <div className="flex flex-col">
            <PostView key={post.id} post={post} />
          </div>
        </div>
      </main>
    </>
  );
};

export default SinglePostView;
