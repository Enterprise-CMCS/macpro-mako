import { MakeGenerics, useMatch } from "@tanstack/react-location";
import { useGetPost } from "../api/useGetPost";

type PostGenerics = MakeGenerics<{
  Params: {
    postId: string;
  };
}>;

export const Post = () => {
  const {
    params: { postId },
  } = useMatch<PostGenerics>();

  const { data, isError, isLoading } = useGetPost(postId);

  if (isLoading) {
    return <>...Loading</>;
  }

  if (isError) {
    return <>...Error</>;
  }

  return (
    <section>
      <h3>{data.title}</h3>
      <p>{data.post}</p>
    </section>
  );
};
