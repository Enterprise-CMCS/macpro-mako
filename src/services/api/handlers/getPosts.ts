import { response } from '../libs/handler'
import * as Models from '../models'
import { PostService } from '../services/postService'

export const getPosts = async () => {
  try {
    const posts = await new PostService(Models.post).getPosts()

    return response({
      statusCode: 200,
      body: posts,
    })
  } catch (error) {
    return response({
      statusCode: 404,
      body: { message: 'Posts not found' },
    })
  }
}

export const handler = getPosts
