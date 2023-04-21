import { User } from '@clerk/nextjs/dist/api';
import z from 'zod';

export const emojiValidatorMessage = 'Only emojis are allowed';
export const emojiValidator = z
  .string()
  .emoji(emojiValidatorMessage)
  .min(1)
  .max(280);

export const filterUserForClient = ({
  username,
  profileImageUrl,
  id,
}: User) => ({
  username,
  profileImageUrl,
  id,
});
