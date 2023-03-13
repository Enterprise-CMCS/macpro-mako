import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Post } from "./useGetPosts";

export const getPostById = async (id: string) => {
  return axios.get<Post>(`https://jsonplaceholder.typicode.com/posts/${id}`);
};

export const useGetPostById = (id: string) =>
  useQuery({
    queryKey: ["posts", id],
    queryFn: () => getPostById(id),
  });
