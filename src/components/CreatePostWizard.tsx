import { useUser } from '@clerk/nextjs';
import { useCallback, useRef } from 'react';
import type { MouseEventHandler } from 'react';
import { api } from '~/utils/api';

const CreatePostWizard = () => {
  const ctx = api.useContext();
  const { user } = useUser();
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      if (inputRef.current?.value) inputRef.current.value = '';
      void ctx.post.getAll.invalidate();
    },
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    if (!inputRef.current?.value) return;
    mutate({ content: inputRef.current.value });
  }, [mutate]);

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
      />
      <button onClick={onSubmit}>Post</button>
    </div>
  );
};

export default CreatePostWizard;
