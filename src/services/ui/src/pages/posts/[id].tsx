import { MakeGenerics, useMatch } from "@tanstack/react-location";
import { useRouter } from "next/router";
import { z } from "zod";
import { useGetPost } from "../../api/useGetPost";

type PostGenerics = MakeGenerics<{
  Params: {
    postId: string;
  };
}>;

export default function Post() {
  const router = useRouter();
  const { id } = router.query;
  const validId = z.string().parse(id);

  const { data, isError, isLoading } = useGetPost(validId);

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
}
