import { api } from '~/utils/api';
import type { RouterOutputs } from '~/utils/api';
import { LoadingPage } from './Loading';
import PostView from './PostView';

type PublicUser = RouterOutputs['profile']['getUserByUsername'];
const ProfileFeed = ({ author }: { author: PublicUser }) => {
  const { id: authorId } = author;
  const { data, isLoading } = api.post.getByAuthorId.useQuery({ authorId });
  if (isLoading) return <LoadingPage />;

  if (!data) return <div>404</div>;
  const fullPosts = data.map((post) => ({ ...post, author }));
  return (
    <div className="flex flex-col">
      {fullPosts.map((post) => (
        <PostView key={post.id} post={post} />
      ))}
    </div>
  );
};

export default ProfileFeed;
