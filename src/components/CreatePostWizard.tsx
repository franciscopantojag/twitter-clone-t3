import { UserButton, useUser } from '@clerk/nextjs';
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
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: {
              width: 56,
              height: 56,
            },
          },
        }}
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
