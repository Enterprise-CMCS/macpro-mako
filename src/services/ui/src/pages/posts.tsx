import { useGetPosts } from '../api/useGetPosts'
import { Link } from 'react-router-dom'
import { formatDistance } from 'date-fns'
import { TrashIcon } from '@heroicons/react/24/outline'

export const Posts = () => {
  const { isLoading, isError, data } = useGetPosts()

  if (isLoading) return <>Loading...</>
  if (isError) return <>Error...</>

  return (
    <>
      <h3 className="text-4xl text-center">Posts</h3>
      <ul className="mx-auto max-w-sm flex flex-col gap-4">
        {data.map((post) => (
          <li key={post.postId}>
            <Link
              to={`/posts/${post.postId}`}
              className="cursor-pointer w-full justify-center items-center flex flex-row shadow-md p-4"
            >
              <div className="flex flex-col flex-1">
                <span className="text-lg">{post.title}</span>
                <span className="font-light">
                  {formatDistance(new Date(post.updatedAt), new Date())} ago
                </span>
              </div>
              <TrashIcon className="h-6 w-6" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
