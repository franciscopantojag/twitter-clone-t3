import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  ChangeEventHandler,
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react';
import toast from 'react-hot-toast';
import { api } from '~/utils/api';
import { emojiValidator, emojiValidatorMessage } from '~/utils/post';

const useMutatePost = (
  inputRef: MutableRefObject<HTMLInputElement | null>,
  isValidContentRef: MutableRefObject<boolean>,
  setIsValidContent: Dispatch<SetStateAction<boolean>>
) => {
  const ctx = api.useContext();
  return api.post.create.useMutation({
    onSuccess: () => {
      if (inputRef.current?.value) {
        inputRef.current.value = '';
        isValidContentRef.current = false;
        setIsValidContent(false);
      }
      void ctx.post.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = Object.entries(
        err.data?.zodError?.fieldErrors ?? {}
      )?.[0]?.[1]?.[0];
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }
      toast.error('Failed to Post! Please try again later');
    },
  });
};

const useCreatePost = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isValidContent, setIsValidContent] = useState(false);
  const isValidContentRef = useRef(false);

  const onContentChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const currentContent = e.target.value;
      const isValidCurrentContent = !!currentContent;
      if (isValidCurrentContent && !isValidContentRef.current) {
        isValidContentRef.current = true;
        setIsValidContent(true);
      } else if (!isValidCurrentContent && isValidContentRef.current) {
        isValidContentRef.current = false;
        setIsValidContent(false);
      }
    },
    []
  );

  const {
    mutate,
    isLoading: isPosting,
    ...mutatePost
  } = useMutatePost(inputRef, isValidContentRef, setIsValidContent);

  const onSubmit = useCallback(() => {
    const currentContent = inputRef.current?.value;
    if (!currentContent) return;

    const { success } = emojiValidator.safeParse(currentContent);
    if (!success) {
      toast(emojiValidatorMessage);
      return;
    }

    mutate({ content: currentContent });
  }, [mutate, inputRef]);

  const isPostingEnabled = useMemo(
    () => !isPosting && isValidContent,
    [isPosting, isValidContent]
  );

  return {
    inputRef,
    onContentChange,
    isValidContent,
    mutate,
    isPosting,
    onSubmit,
    isPostingEnabled,
    ...mutatePost,
  };
};
export default useCreatePost;
