import { DynamoDB } from "@aws-sdk/client-dynamodb";
import type { Post } from "../../../shared/types/post";

export class PostService {
  private db: DynamoDB;

  constructor(dynamoInstance: DynamoDB) {
    this.db = dynamoInstance;
  }

  async getPosts() {}

  async getPost(id: string) {}

  async createPost(post: Post) {}

  async updatePost(id: string, post: Post) {}

  async deletePost(id: string) {}
}
