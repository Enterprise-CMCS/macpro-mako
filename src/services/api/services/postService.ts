import { DynamoDB } from "@aws-sdk/client-dynamodb";
import type { Post } from "../types/Post";

export class PostService {
  private db: DynamoDB;

  constructor(dynamoInstance: DynamoDB) {
    this.db = dynamoInstance;
  }

  async getPosts() {}

  async getPost(id: string) {}

  async createPost(post: Omit<Post, "id">) {}

  async updatePost(id: string, post: Omit<Post, "id">) {}

  async deletePost(id: string) {}
}
