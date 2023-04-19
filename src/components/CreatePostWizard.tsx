import { useUser } from '@clerk/nextjs';

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <img
        alt="Profile Picture"
        src={user.profileImageUrl}
        className="h-14 w-14 rounded-full"
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

export default CreatePostWizard;
