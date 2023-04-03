import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { CreatePost, validateCreatePost } from "./validators";

const queryClient = useQueryClient();

export const useCreatePost = () =>
  useMutation({
    mutationFn: async (post: CreatePost) => {
      const validPost = validateCreatePost(post);

      return await instance.post("/post", validPost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });
