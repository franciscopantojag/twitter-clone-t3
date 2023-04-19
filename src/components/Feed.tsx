import { api } from '~/utils/api';
import { LoadingPage } from './Loading';
import PostView from './PostView';

const Feed = () => {
  const { data, isLoading } = api.post.getAll.useQuery();
  if (isLoading) return <LoadingPage />;

  return (
    <div className="flex flex-col">
      {data?.map((post) => (
        <PostView key={post.id} post={post} />
      ))}
    </div>
  );
};
export default Feed;
