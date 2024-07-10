import { produceMessage } from "../../libs/kafka";
import { config } from "./consts";
import { MakoWriteService } from "./services/mako-write-service";
import { PackageActionWriteService } from "./services/package-action-write-service";
import { SeatoolWriteService } from "./services/seatool-write-service";

export const setupWriteService = async () => {
  const seatool = await SeatoolWriteService.createSeatoolService(config);
  const mako = new MakoWriteService(produceMessage);

  return new PackageActionWriteService(seatool, mako);
};
