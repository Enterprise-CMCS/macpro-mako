import { Link, useLoadRoute, Outlet } from "@tanstack/react-location";
import { useCreatePost } from "../api/useCreatePost";
import { useGetPosts } from "../api/useGetPosts";

export const Posts = () => {
  const { data, isLoading, isError } = useGetPosts();
  const mutation = useCreatePost();
  const loadRoute = useLoadRoute();

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
      <Outlet />
      <ul>
        {data.map((post) => (
          <li key={post.postId}>
            <Link
              onMouseEnter={() => loadRoute({ to: post.postId })}
              to={`./${post.postId}`}
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};
