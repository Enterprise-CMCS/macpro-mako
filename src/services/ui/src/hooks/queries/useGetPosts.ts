import { useQuery } from "@tanstack/react-query";
import { instance } from "../../lib/axios";

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export const getPosts = async () => {
  return instance.get("/posts");
};

export const useGetPosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
