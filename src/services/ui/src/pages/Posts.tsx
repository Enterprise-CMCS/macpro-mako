import { Link, useLoadRoute, Outlet } from "@tanstack/react-location";
import { useGetPosts } from "../hooks/queries/useGetPosts";

export const Posts = () => {
  const { data, isLoading, isError } = useGetPosts();
  console.log(data);
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
        {data.data.map((post: any) => (
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
