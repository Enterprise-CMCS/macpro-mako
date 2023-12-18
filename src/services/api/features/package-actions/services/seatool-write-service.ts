import * as sql from "mssql";
import * as query from "@/features/package-actions/queries";

export class PackageActionWriteService {
  private readonly transaction: sql.Transaction;

  private constructor(connection: sql.ConnectionPool) {
    this.transaction = new sql.Transaction(connection);
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
}
