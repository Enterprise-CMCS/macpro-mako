import { ModelType } from "dynamoose/dist/General";
import { v4 } from "uuid";
import { CreatePost, PostModel } from "../models/Post";

export class PostService {
  #postModel: ModelType<PostModel>;

  constructor(postModel: ModelType<PostModel>) {
    this.#postModel = postModel;
  }

  async createPost(post: CreatePost) {
    const postId = v4();

    return await this.#postModel.create({ postId, ...post });
  }

  async getPost(postId: string) {
    return await this.#postModel.get(postId);
  }

  async getPosts() {
    return await this.#postModel.query("createdAt").gt(0).exec();
  }

  async deletePost(postId: string) {
    const postToDelete = await this.getPost(postId);

    await postToDelete.delete();

    return postToDelete;
  }

  async editPost(
    postId: string,
    partialPost: Omit<ModelType<PostModel>, "postId">
  ) {
    return await this.#postModel.update({ postId }, { ...partialPost });
  }
}
