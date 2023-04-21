import { useMutation, useQueryClient } from '@tanstack/react-query'
import { instance } from '../lib/axios'
import { CreatePost, validateCreatePost } from './validators'

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (post: CreatePost) => {
      const validPost = validateCreatePost(post)

      return await instance.post('/posts', validPost)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts'])
    },
  })
}
