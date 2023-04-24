import { ModelType } from "dynamoose/dist/General";
import { v4 } from "uuid";
import { CreateIssue, IssueModel } from "../models/Issue";

export class IssueService {
  #issueModel: ModelType<IssueModel>;

  constructor(issueModel: ModelType<IssueModel>) {
    this.#issueModel = issueModel;
  }

  async createIssue(issue: CreateIssue) {
    const issueId = v4();

    return await this.#issueModel.create({ issueId, ...issue });
  }

  async getIssue(issueId: string) {
    return await this.#issueModel.get({ issueId });
  }

  async getIssues() {
    return await this.#issueModel.scan().exec();
  }

  async deleteIssue(issueId: string) {
    const issueToDelete = await this.getIssue(issueId);

    await issueToDelete.delete();

    return issueToDelete;
  }

  async editIssue(
    issueId: string,
    partialIssue: Omit<ModelType<IssueModel>, "issueId">
  ) {
    return await this.#issueModel.update({ issueId }, { ...partialIssue });
  }
}
