import type { GetStaticProps } from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import Head from 'next/head';
import { api } from '~/utils/api';
import type { RouterOutputs } from '~/utils/api';
import { appRouter } from '~/server/api/root';
import superjson from 'superjson';
import { prisma } from '~/server/db';
import PostView from '~/components/PostView';
import { LoadingPage } from '~/components/Loading';

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
type PublicUser = RouterOutputs['profile']['getUserByUsername'];
const ProfileFeed = ({ author }: { author: PublicUser }) => {
  const { id: authorId } = author;
  const { data, isLoading } = api.post.getByAuthorId.useQuery({ authorId });
  if (isLoading) return <LoadingPage />;

  if (!data) return <div>404</div>;
  const fullPosts = data.map((post) => ({ ...post, author }));
  return (
    <>
      <div className="flex flex-col">
        {fullPosts.map((post) => (
          <PostView key={post.id} post={post} />
        ))}
      </div>
    </>
  );
};

const ProfilePage = ({ username }: { username: string }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;
  const textId = `@${data.username}`;

  return (
    <>
      <Head>
        <title>{`@${data.username}`}</title>
      </Head>
      <main className="flex min-h-screen justify-center">
        <div className="flex min-h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
          <div className="relative h-36 bg-slate-600">
            <img
              width={128}
              height={128}
              className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
              alt={`Profile Image of ${data.username}`}
              src={data.profileImageUrl}
            />
          </div>
          <div className="h-[64px]" />
          <div className="border-b border-slate-400 p-4 text-2xl font-bold">
            {textId}
          </div>
          <ProfileFeed author={data} />
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
