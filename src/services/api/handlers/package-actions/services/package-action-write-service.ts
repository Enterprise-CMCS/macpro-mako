import {
  MakoWriteService,
  CompleteIntakeDto as MakoCompleteIntake,
} from "./mako-write-service";
import {
  SeatoolWriteService,
  CompleteIntakeDto as SeaCompleteIntake,
} from "./seatool-write-service";

type CompleteIntakeDto = MakoCompleteIntake & SeaCompleteIntake;

export class PackageActionWriteService {
  #seatoolWriteService: SeatoolWriteService;
  #makoWriteService: MakoWriteService;

  constructor(seatool: SeatoolWriteService, mako: MakoWriteService) {
    this.#makoWriteService = mako;
    this.#seatoolWriteService = seatool;
  }

  async completeIntake({
    action,
    cpoc,
    description,
    id,
    subTypeIds,
    subject,
    submitterName,
    timestamp,
    topicName,
    typeIds,
    ...data
  }: CompleteIntakeDto) {
    try {
      await this.#seatoolWriteService.trx.begin();
      await this.#seatoolWriteService.completeIntake({
        typeIds,
        subTypeIds,
        id,
        cpoc,
        description,
        subject,
        submitterName,
      });
      await this.#makoWriteService.completeIntake({
        action,
        id,
        timestamp,
        topicName,
        ...data,
      });
      await this.#seatoolWriteService.trx.commit();
    } catch (err: unknown) {
      console.log("AN ERROR OCCURED: ", err);
      this.#seatoolWriteService.trx.rollback();
    }
  }
}
