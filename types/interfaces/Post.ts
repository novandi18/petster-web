import { UserResult } from "./UserResult";

export type PostLike = {
  id?: string;
  createdAt?: Date;
};

export type PostComment = {
  id?: string;
  authorId?: string;
  authorType?: string;
  comment?: string;
  replyToCommentId?: string;
  author?: UserResult;
  createdAt?: Date;
};

export type Post = {
  id?: string;
  authorId?: string;
  authorType?: string;
  content?: string;
  comments?: PostComment[];
  likes?: PostLike[];
  author?: UserResult;
  createdAt?: Date;
};

export type PostResult = {
  posts?: Post;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
};
