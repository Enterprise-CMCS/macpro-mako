import { useQuery } from "@tanstack/react-query";
import { instance } from "../lib/axios";
import { validatePosts } from "./validators";

export const useGetPosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const posts = await instance.get("/posts");
      const validPosts = validatePosts(posts);

      return validPosts;
    },
  });
