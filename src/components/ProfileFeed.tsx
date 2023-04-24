import { api } from '~/utils/api';
import type { RouterOutputs } from '~/utils/api';
import { LoadingPage } from './Loading';
import PostView from './PostView';
import { useMemo } from 'react';

type PublicUser = RouterOutputs['profile']['getUserByUsername'];
const ProfileFeed = ({ author }: { author: PublicUser }) => {
  const { id: authorId } = author;
  const { data, isLoading } = api.post.getByAuthorId.useQuery({ authorId });
  const fullPosts = useMemo(
    () => data?.map((post) => ({ ...post, author })) ?? [],
    [data, author]
  );
  if (isLoading) return <LoadingPage />;

  if (!data) return <div>404</div>;
  return (
    <div className="flex flex-col">
      {fullPosts.map((post) => (
        <PostView key={post.id} post={post} />
      ))}
    </div>
  );
};

export default ProfileFeed;
