import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export const getPosts = async () => {
  return axios.get<Post[]>("https://jsonplaceholder.typicode.com/posts");
};

export const useGetPosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
