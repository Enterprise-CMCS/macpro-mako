import * as sql from "mssql";
import * as query from "@/features/package-actions/queries";
import { raiIssueSchema } from "shared-types";
import { z } from "zod";
import { APIError } from "./error-handle-service";

type ISeatoolWriteService = {
  withdrawRai: (queryParams: query.WithdrawRaiQueryParams) => Promise<void>;
  issueRai: (raiData: z.infer<typeof raiIssueSchema>) => Promise<void>;
  respondToRai: (queryParams: query.RespondToRaiQueryParams) => Promise<void>;
  changePackageStatus: (
    queryParams: query.ChangePackageStatusQueryParams
  ) => Promise<void>;
};

export class SeatoolWriteService implements ISeatoolWriteService {
  private readonly seatoolTransaction: sql.Transaction;

  constructor(seatoolConnection: sql.ConnectionPool) {
    this.seatoolTransaction = new sql.Transaction(seatoolConnection);
  }

  private handleTransaction = async (
    transactionCallback: () => Promise<void>
  ) => {
    try {
      await this.seatoolTransaction.begin();

      await transactionCallback();

      await this.seatoolTransaction.commit();
    } catch (error: unknown) {
      await this.seatoolTransaction.rollback();

      console.error(error);

      throw new APIError("Failed to write to Seatool.");
    }
  };

  async withdrawRai({
    id,
    activeRaiDate,
    withdrawnDate,
  }: query.WithdrawRaiQueryParams) {
    await this.handleTransaction(async () => {
      await this.seatoolTransaction
        .request()
        .query(query.withdrawRaiQuery({ id, activeRaiDate, withdrawnDate }));
    });
  }

  async issueRai(raiData: z.infer<typeof raiIssueSchema>) {
    await this.handleTransaction(async () => {
      await this.seatoolTransaction.request().query(
        query.issueRaiQuery({
          id: raiData.id,
          requestedDate: raiData.requestedDate,
        })
      );
    });
  }

  async respondToRai({
    id,
    latestRai,
    responseDate,
  }: query.RespondToRaiQueryParams) {
    await this.handleTransaction(async () => {
      await this.seatoolTransaction
        .request()
        .query(query.respondToRaiQuery({ id, latestRai, responseDate }));
    });
  }

  async changePackageStatus({
    id,
    status,
  }: query.ChangePackageStatusQueryParams) {
    await this.handleTransaction(async () => {
      await this.seatoolTransaction
        .request()
        .query(query.changePackageStatusQuery({ id, status }));
    });
  }
}
