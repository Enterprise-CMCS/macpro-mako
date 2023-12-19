import * as sql from "mssql";
import * as query from "@/features/package-actions/queries";
import { type KafkaConfig } from "kafkajs";
import { KafkaService } from "@/shared/onemac-micro-kafka";
import { Action } from "shared-types";

export class PackageActionWriteService {
  private readonly seatoolTxn: sql.Transaction;
  private readonly bigmac: KafkaService;

  private constructor(
    seatoolConnection: sql.ConnectionPool,
    bigmacConnection: KafkaConfig
  ) {
    this.seatoolTxn = new sql.Transaction(seatoolConnection);
    this.bigmac = new KafkaService(bigmacConnection);
  }

  static async create(
    seatoolConnection: sql.config,
    bigmacConnection: KafkaConfig
  ) {
    const seatoolConnectionPool = await sql.connect(seatoolConnection);
    return new PackageActionWriteService(
      seatoolConnectionPool,
      bigmacConnection
    );
  }

  async withdrawRai({
    id,
    activeRaiDate,
    withdrawnDate,
  }: query.WithdrawRaiQueryParams) {
    try {
      await this.seatoolTxn.begin();

      await this.seatoolTxn
        .request()
        .query(query.withdrawRaiQuery({ id, activeRaiDate, withdrawnDate }));

      await this.seatoolTxn.commit();
    } catch (err: unknown) {
      console.error(err);
      await this.seatoolTxn.rollback();
    }
  }

  async changePackageStatus({
    id,
    status,
  }: query.ChangePackageStatusQueryParams) {
    try {
      await this.seatoolTxn.begin();

      await this.seatoolTxn
        .request()
        .query(query.changePackageStatusQuery({ id, status }));

      await this.seatoolTxn.commit();
    } catch (err: unknown) {
      console.error(err);
      await this.seatoolTxn.rollback();
    }
  }

  async setWithdrawEnabled({
    id,
    withdrawEnabled,
    topicName,
    authority,
  }: {
    id: string;
    withdrawEnabled: boolean;
    topicName: string;
    authority: string;
  }) {
    await this.bigmac.produceMessage(
      id,
      topicName,
      JSON.stringify({
        raiWithdrawEnabled: withdrawEnabled,
        actionType: withdrawEnabled
          ? Action.ENABLE_RAI_WITHDRAW
          : Action.DISABLE_RAI_WITHDRAW,
        authority,
        origin,
      })
    );
  }
}
