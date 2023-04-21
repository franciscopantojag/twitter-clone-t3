import type { GetStaticProps } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import Head from 'next/head';
import { api } from '~/utils/api';
import { appRouter } from '~/server/api/root';
import superjson from 'superjson';
import { prisma } from '~/server/db';

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking', // can also be true or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  const slug = ctx.params?.slug;
  if (typeof slug !== 'string') throw new Error('no slug');
  await ssg.profile.getUserByUsername.prefetch({ username: slug });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      username: slug,
    },
  };
};

const ProfilePage = ({ username }: { username: string }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`Profile - @${data.username}`}</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>{data.username}</div>
      </main>
    </>
  );
};

export default ProfilePage;
