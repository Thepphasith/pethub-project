import { UserModel } from "./user";

export interface BlogPostModel {
  id: string;
  userId: string;
  comments: string[];
  saved:string[];
  username: string;
  timestamp: string;
  title: string;
  user: UserModel;
  body: string;
  images: string[];
  isActive: boolean;
  createdAt: string; // or Date if you convert it
  updatedAt: string; // or Date if you convert it
}
