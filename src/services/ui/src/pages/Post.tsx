import { MakeGenerics, useMatch } from "@tanstack/react-location";
import { useGetPostById } from "../hooks/queries/useGetPostById";

type PostGenerics = MakeGenerics<{
  Params: {
    postId: string;
  };
}>;

export const Post = () => {
  const {
    params: { postId },
  } = useMatch<PostGenerics>();

  const { data, isError, isLoading } = useGetPostById(postId);

  if (isLoading) {
    return <>...Loading</>;
  }

  if (isError) {
    return <>...Error</>;
  }

  return (
    <section>
      <h3>{data.data.title}</h3>
      <p>{data.data.body}</p>
    </section>
  );
};
