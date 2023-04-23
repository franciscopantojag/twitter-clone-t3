import { api, type RouterOutputs } from '~/utils/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { buildRelative } from '~/utils/post';
import { useUser } from '@clerk/nextjs';
import PostDropdown from './PostDropdown';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs['post']['getAll'][number];
interface Props {
  post: PostWithUser;
}

const PostView: React.FC<Props> = ({
  post: { id, content, author, createdAt },
}) => {
  const fromNow = buildRelative(createdAt);
  const textId = `@${author.username}`;
  const { user } = useUser();
  const showDrop = user?.id === author?.id;

  const [isPostOpaque, setIsPostOpaque] = useState(false);

  const ctx = api.useContext();

  const { mutate } = api.post.deleteById.useMutation({
    onSuccess: async () => {
      try {
        await ctx.post.getAll.invalidate();
        setIsPostOpaque(false);
      } catch (error) {
        toast.error('Something went wrong. Please refresh the page');
        setIsPostOpaque(false);
      }
    },
    onError: () => {
      toast.error("Couldn't remove post. Please try again later");
      setIsPostOpaque(false);
    },
  });

  const onDelete = useCallback(() => {
    mutate({ postId: id });
    setIsPostOpaque(true);
  }, [mutate, id]);

  return (
    <>
      <div className="border-b border-slate-400">
        <div
          key={id}
          className={`flex gap-3 p-4${isPostOpaque ? ' opacity-50' : ''}`}
        >
          <Link href={`/${author.username}`}>
            <img
              src={author.profileImageUrl}
              alt={`Profile Image of ${author.username}`}
              className="h-14 w-14 rounded-full"
            />
          </Link>

          <div className="flex flex-grow flex-col">
            <div className="flex items-center justify-between">
              <div className="flex flex-grow gap-1 text-slate-300">
                <Link href={`/${author.username}`}>
                  <span>{textId}</span>
                </Link>

                <span>·</span>
                <Link href={`/post/${id}`}>
                  <span className="font-thin">{fromNow}</span>
                </Link>
              </div>
              <div className="h-6 w-8 pl-2">
                {showDrop && <PostDropdown onDelete={onDelete} />}
              </div>
            </div>
            <span className="text-2xl">{content}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostView;
