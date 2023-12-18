import * as sql from "mssql";
import * as query from "@/features/package-actions/queries";
import { type Producer } from "kafkajs";
import { KafkaService } from "@/shared/onemac-micro-kafka";
import { kafkaConfig } from "@/features/package-actions/consts/kafka-connection";

export class PackageActionWriteService {
  private readonly transaction: sql.Transaction;
  private readonly kafka: KafkaService;

  private constructor(connection: sql.ConnectionPool) {
    this.transaction = new sql.Transaction(connection);
    this.kafka = new KafkaService(kafkaConfig);
  }

  static async create(connection: sql.config) {
    const pool = await sql.connect(connection);
    return new PackageActionWriteService(pool);
  }

  async withdrawRai({
    id,
    activeRaiDate,
    withdrawnDate,
  }: query.WithdrawRaiQueryParams) {
    try {
      await this.transaction.begin();

      await this.transaction
        .request()
        .query(query.withdrawRaiQuery({ id, activeRaiDate, withdrawnDate }));

      await this.transaction.commit();
    } catch (err: unknown) {
      console.error(err);
      await this.transaction.rollback();
    }
  }

  async changePackageStatus({
    id,
    status,
  }: query.ChangePackageStatusQueryParams) {
    try {
      await this.transaction.begin();

      await this.transaction
        .request()
        .query(query.changePackageStatusQuery({ id, status }));

      await this.transaction.commit();
    } catch (err: unknown) {
      console.error(err);
      await this.transaction.rollback();
    }
  }

  async setWithdrawEnabled({ withdrawEnabled }: { withdrawEnabled: boolean }) {
    console.log(withdrawEnabled);
  }
}
