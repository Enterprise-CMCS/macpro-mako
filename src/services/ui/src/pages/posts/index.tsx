import Link from "next/link";
import { useCreatePost } from "../../api/useCreatePost";
import { useGetPosts } from "../../api/useGetPosts";

export default function Posts() {
  const { data, isLoading, isError } = useGetPosts();
  const mutation = useCreatePost();

  if (isLoading) {
    return <>...Loading</>;
  }

  if (isError) {
    return <>...Error</>;
  }

  return (
    <>
      <h1>Posts</h1>
      <button
        onClick={() =>
          mutation.mutate({ post: "hello world", title: "testing 123" })
        }
      >
        Temp Test Post Creation
      </button>
      <ul>
        {data.map((post) => (
          <li key={post.postId}>
            <Link href={`posts/${post.postId}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
