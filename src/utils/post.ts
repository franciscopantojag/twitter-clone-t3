import type { User } from '@clerk/nextjs/dist/api';
import type { Post } from '@prisma/client';
import dayjs from 'dayjs';
import z from 'zod';
import type { PublicProfile } from '~/interfaces/profile';
import { buildPublicProfile } from './profile';

export const emojiValidatorMessage = 'Only emojis are allowed';
export const emojiValidator = z
  .string()
  .emoji(emojiValidatorMessage)
  .min(1)
  .max(280);

const SECOND = 1000; // 1s
const MINUTE = SECOND * 60; // 1min
const HOUR = MINUTE * 60; // 1h
const DAY = 24 * HOUR; // 1d
const WEEK = 7 * DAY; // 1w
const FOUR_WEEK = 4 * WEEK; // 24 abr

export const buildRelative = (createdAt: Date) => {
  const msDiff = new Date().getTime() - createdAt.getTime();
  if (msDiff < MINUTE) {
    const seconds = Math.floor(msDiff / SECOND);
    if (seconds === 0) return `Now`;
    return `${seconds}s`;
  }
  if (msDiff < HOUR) {
    const minutes = Math.floor(msDiff / MINUTE);
    return `${minutes}min`;
  }
  if (msDiff < DAY) {
    const hours = Math.floor(msDiff / HOUR);
    return `${hours}h`;
  }
  if (msDiff < WEEK) {
    const days = Math.floor(msDiff / DAY);
    return `${days}d`;
  }
  if (msDiff <= FOUR_WEEK) {
    const weeks = Math.floor(msDiff / WEEK);
    return `${weeks}w`;
  }
  const isSameYear = dayjs().isSame(createdAt, 'y');
  if (isSameYear) {
    return dayjs(createdAt).format('D MMM');
  }
  return dayjs(createdAt).format('D MMM YY');
};
interface UsersById {
  [key: string]: PublicProfile;
}

type PostWithAuthor = Post & {
  author: PublicProfile;
};
export const buildPosts = (posts: Post[], users: User[]) => {
  const usersById = users.reduce((acc, user) => {
    const publicProfile = buildPublicProfile(user);
    if (!publicProfile) return acc;
    acc[publicProfile.id] = publicProfile;
    return acc;
  }, {} as UsersById);

  return posts.reduce((acc, post) => {
    const author = usersById[post.authorId];
    if (!author) return acc;
    acc.push({ ...post, author });
    return acc;
  }, [] as PostWithAuthor[]);
};
