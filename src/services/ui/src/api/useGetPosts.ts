import { useQuery } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { Post, validatePosts } from "./validators";

export const useGetPosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const posts = await instance.get<Post[]>("/posts");
      const validPosts = validatePosts(posts.data);

      return validPosts;
    },
  });
