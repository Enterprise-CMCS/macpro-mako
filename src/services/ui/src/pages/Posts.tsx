import { Link, useLoadRoute, Outlet } from "@tanstack/react-location";
import { useGetPosts } from "../api/useGetPosts";
import { Post } from "../api/validators";

export const Posts = () => {
  const { data, isLoading, isError } = useGetPosts();
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
      <Outlet />
      <ul>
        {data.map((post: Post) => (
          <li key={post.id}>
            <Link
              onMouseEnter={() => loadRoute({ to: post.id })}
              to={`./${post.id}`}
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};
