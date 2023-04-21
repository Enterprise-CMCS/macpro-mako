import { z, ZodError } from 'zod'
import { response } from '../libs/handler'
import { post } from '../models/Post'
import { PostService } from '../services/postService'

export const deletePost = async ({ pathParameters }) => {
  try {
    const validParams = z.object({
      id: z.string().uuid(),
    })

    const params = validParams.parse(pathParameters)

    const postToDelete = await new PostService(post).deletePost(params.id)

    return response({
      statusCode: 200,
      body: postToDelete,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return response({
        statusCode: 404,
        body: { message: error },
      })
    }
  }
}

export const handler = deletePost
