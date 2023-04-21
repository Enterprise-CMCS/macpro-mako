import { useParams } from 'react-router-dom'
import { z } from 'zod'
import { useGetPost } from '../api/useGetPost'

export const Post = () => {
  const { id } = useParams()
  const validId = z.string().parse(id)

  const { isLoading, isError, data: post } = useGetPost(validId)

  if (isLoading) return <>...Loading</>
  if (isError) return <>...Error</>

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-0">{post.title}</h1>
      <p>Last Updated - {post.updatedAt}</p>
      <div>{post.post}</div>
    </div>
  )
}
