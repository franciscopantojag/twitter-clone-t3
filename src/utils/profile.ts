import { type User } from '@clerk/nextjs/dist/api';
import type { PublicProfile } from '~/interfaces/profile';
export const buildPublicProfile = (
  user: User | undefined
): PublicProfile | undefined => {
  if (!user?.username) return;
  const { id, username, profileImageUrl, firstName, lastName } = user;
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  return { id, username, profileImageUrl, fullName };
};
