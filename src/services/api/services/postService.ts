import { ModelType } from "dynamoose/dist/General";
import { v4 } from "uuid";
import { Post, PostModel } from "../models/Post";

export class PostService {
  #postModel: ModelType<PostModel>;

  constructor(postModel: ModelType<PostModel>) {
    this.#postModel = postModel;
  }

  async createPost(post: Post) {
    const id = v4();

    return await this.#postModel.create({ id, ...post });
  }

  async getPost(id: string) {
    return await this.#postModel.get(id);
  }

  async deletePost(id: string) {
    const postToDelete = await this.getPost(id);

    await postToDelete.delete();

    return postToDelete;
  }

  async editPost(id: string, partialPost: Omit<ModelType<PostModel>, "id">) {
    return await this.#postModel.update({ id }, { ...partialPost });
  }
}
