import { useGetPosts } from "../api/useGetPosts";
import { Link } from "react-router-dom";

export const Posts = () => {
  const { isLoading, isError, data } = useGetPosts();

  console.log(data);

  if (isLoading) return <>Loading...</>;
  if (isError) return <>Error...</>;

  return (
    <>
      <h3 className="text-4xl text-center">Posts</h3>
      <ul className="mx-auto max-w-sm">
        {data.map((post) => (
          <li>
            <Link
              to={`/posts/${post.postId}`}
              className="cursor-pointer max-w-xs"
            >
              <a className="underline hover:decoration-purple-500 hover:text-purple-500">
                {post.title}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};
