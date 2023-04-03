import { Link, useLoadRoute, Outlet } from "@tanstack/react-location";
import { useCreatePost } from "../api/useCreatePost";
import { useGetPosts } from "../api/useGetPosts";
import { Post } from "../api/validators";

export const Posts = () => {
  const { data: testData, isLoading, isError } = useGetPosts();
  const mutation = useCreatePost();
  const loadRoute = useLoadRoute();

  console.log(testData);
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
        {/* {data.map((post: Post) => (
          <li key={post.id}>
            <Link
              onMouseEnter={() => loadRoute({ to: post.id })}
              to={`./${post.id}`}
            >
              {post.title}
            </Link>
          </li>
        ))} */}
      </ul>
    </>
  );
};
