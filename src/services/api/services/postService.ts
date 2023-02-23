import { DynamoDB } from "@aws-sdk/client-dynamodb";
import type { Post } from "../types/Post";

export class PostService {
  private db: DynamoDB;

  constructor(dynamoInstance: DynamoDB) {
    this.db = dynamoInstance;
  }

  async getPosts() {
    console.log("getPosts() called");
  }

  async getPost(id: string) {
    console.log("getPost() called");
  }

  async createPost(post: Omit<Post, "id">) {
    console.log("createPost() called");
  }

  async updatePost(id: string, post: Omit<Post, "id">) {
    console.log("updatePost() called");
  }

  async deletePost(id: string) {
    console.log("deletePost() called");
  }
}
