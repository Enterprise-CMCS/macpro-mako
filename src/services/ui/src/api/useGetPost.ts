import { useQuery } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { validatePost } from "./validators";

export const useGetPost = (id: string) =>
  useQuery({
    queryKey: ["posts", id],
    queryFn: async () => {
      const post = await instance.get(`/posts/${id}`);
      const validPost = validatePost(post);

      return validPost;
    },
  });
