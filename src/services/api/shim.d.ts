declare module "knex/lib/dialects/mssql" {
  import { Knex } from "knex";
  const client: typeof Knex.Client;
  export default client;
}
