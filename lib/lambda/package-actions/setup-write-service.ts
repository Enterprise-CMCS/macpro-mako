import { getSecret } from "shared-utils";
import { produceMessage } from "../../libs/api/kafka";
import { getIdsToUpdate } from "./get-id-to-update";
import { MakoWriteService } from "./services/mako-write-service";
import { PackageActionWriteService } from "./services/package-action-write-service";
import { SeatoolWriteService } from "./services/seatool-write-service";
import * as sql from "mssql";

export const setupWriteService = async () => {
  const secretName = process.env.dbInfoSecretName;
  if (!secretName) {
    throw new Error("Environment variable dbInfoSecretName is not set");
  }
  const secret = JSON.parse(await getSecret(secretName));
  const { ip, port, user, password } = secret;
  const config = {
    user,
    password,
    server: ip,
    port: parseInt(port as string),
    database: "SEA",
  } as sql.config;

  const seatool = await SeatoolWriteService.createSeatoolService(config);
  const mako = new MakoWriteService(produceMessage);

  return new PackageActionWriteService(seatool, mako, getIdsToUpdate);
};
