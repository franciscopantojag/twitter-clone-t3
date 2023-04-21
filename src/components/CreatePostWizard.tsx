import { useUser } from '@clerk/nextjs';
import { LoadingSpinner } from './Loading';
import useCreatePost from '~/hooks/useCreatePost';
import { useCallback } from 'react';
import type { KeyboardEventHandler } from 'react';

const CreatePostWizard = () => {
  const { user } = useUser();
  const { isPosting, inputRef, onContentChange, isPostingEnabled, onSubmit } =
    useCreatePost();
  const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (e) => {
      if (!(e.key === 'Enter')) return;
      e.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );
  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <img
        alt="Profile Picture"
        src={user.profileImageUrl}
        className="h-14 w-14 rounded-full"
      />
      <input
        ref={inputRef}
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        disabled={isPosting}
        onChange={onContentChange}
        onKeyDown={onKeyDown}
      />
      {isPostingEnabled && (
        <button disabled={isPosting} onClick={onSubmit}>
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

export default CreatePostWizard;
