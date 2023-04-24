import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { api } from '~/utils/api';
import Layout from '~/components/Layout';
import ProfileFeed from '~/components/ProfileFeed';
import { createSSG } from '~/utils/client';

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking', // can also be true or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const ssg = createSSG();
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
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;
  const textId = `@${data.username}`;

  return (
    <>
      <Layout>
        <Head>
          <title>{textId}</title>
        </Head>
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
      </Layout>
    </>
  );
};

export default ProfilePage;
