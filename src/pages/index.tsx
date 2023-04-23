import { SignInButton, useUser } from '@clerk/nextjs';
import type { NextPage } from 'next';
import CreatePostWizard from '~/components/CreatePostWizard';
import Feed from '~/components/Feed';
import Layout from '~/components/Layout';
import { api } from '~/utils/api';

const Home: NextPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  api.post.getAll.useQuery();
  if (!isLoaded) return null;
  return (
    <>
      <Layout>
        <div className="flex border-y border-slate-400 p-4">
          {isSignedIn && <CreatePostWizard />}
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
        </div>
        <Feed />
      </Layout>
    </>
  );
};

export default Home;
