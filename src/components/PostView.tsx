import { type RouterOutputs } from '~/utils/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs['post']['getAll'][number];
interface Props {
  post: PostWithUser;
}

const PostView: React.FC<Props> = ({
  post: { id, content, author, createdAt },
}) => {
  const fromNow = dayjs(createdAt).fromNow();
  const textId = `@${author.username}`;
  return (
    <div key={id} className="flex gap-3 border-b border-slate-400 p-4">
      <Link href={`/${author.username}`}>
        <img
          src={author.profileImageUrl}
          alt={`Profile Image of ${author.username}`}
          className="h-14 w-14 rounded-full"
        />
      </Link>

      <div className="flex flex-col gap-[2px]">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/${author.username}`}>
            <span>{textId}</span>
          </Link>

          <span>·</span>
          <Link href={`/post/${id}`}>
            <span className="font-thin">{fromNow}</span>
          </Link>
        </div>
        <span className="text-2xl">{content}</span>
      </div>
    </div>
  );
};

export default PostView;
