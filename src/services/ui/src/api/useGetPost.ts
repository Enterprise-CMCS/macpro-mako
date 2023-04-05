import { useQuery } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { validatePost } from "./validators";

export const getPost = async (id: string) => {
  const post = await instance.get(`/posts/${id}`);
  const validPost = validatePost(post);

  return validPost;
};

export const useGetPost = (id: string) =>
  useQuery({
    queryKey: ["posts", id],
    queryFn: async () => {
      return await getPost(id);
    },
  });
