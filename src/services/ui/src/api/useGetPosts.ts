import { useQuery } from '@tanstack/react-query'
import { instance } from '../lib/axios'
import { validatePosts } from './validators'

export const getPosts = async () => {
  const posts = await instance.get('/posts')
  const validPosts = validatePosts(posts.data)

  return validPosts
}

export const useGetPosts = () =>
  useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })
