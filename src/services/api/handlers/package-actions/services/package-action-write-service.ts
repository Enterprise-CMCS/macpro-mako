import { Action } from "shared-types";
import {
  MakoWriteService,
  IssueRaiDto as MakoIssueRaiDto,
  CompleteIntakeDto as MakoCompleteIntake,
  RespondToRaiDto as MakoRespondToRai,
  ToggleRaiResponseDto,
} from "./mako-write-service";
import {
  SeatoolWriteService,
  IssueRaiDto as SeaIssueRaiDto,
  CompleteIntakeDto as SeaCompleteIntake,
  RespondToRaiDto as SeaRespondToRai,
} from "./seatool-write-service";

type IdsToUpdateFunction = (lookupId: string) => Promise<string[]>;

type CompleteIntakeDto = MakoCompleteIntake & SeaCompleteIntake;
type IssueRaiDto = SeaIssueRaiDto & MakoIssueRaiDto;
type RespondToRaiDto = SeaRespondToRai & MakoRespondToRai;

export class PackageActionWriteService {
  #seatoolWriteService: SeatoolWriteService;
  #makoWriteService: MakoWriteService;
  #getIdsToUpdate: IdsToUpdateFunction;

  constructor(
    seatool: SeatoolWriteService,
    mako: MakoWriteService,
    idsToUpdateFunction: IdsToUpdateFunction,
  ) {
    this.#makoWriteService = mako;
    this.#seatoolWriteService = seatool;
    this.#getIdsToUpdate = idsToUpdateFunction;
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

  async issueRai({
    action,
    id,
    spwStatus,
    timestamp,
    topicName,
    ...data
  }: IssueRaiDto) {
    try {
      await this.#seatoolWriteService.trx.begin();
      const idsToUpdate = await this.#getIdsToUpdate(id);

      for (const id of idsToUpdate) {
        await this.#seatoolWriteService.issueRai({ id, spwStatus, timestamp });
        await this.#makoWriteService.issueRai({
          action,
          id,
          topicName,
          ...data,
        });
      }

      await this.#seatoolWriteService.trx.commit();
    } catch (err: unknown) {
      await this.#seatoolWriteService.trx.rollback();

      console.error(err);
    }
  }

  async respondToRai({
    action,
    id,
    raiReceivedDate,
    raiToRespondTo,
    raiWithdrawnDate,
    responseDate,
    spwStatus,
    timestamp,
    topicName,
    ...data
  }: RespondToRaiDto) {
    try {
      await this.#seatoolWriteService.trx.begin();
      const idsToUpdate = await this.#getIdsToUpdate(id);

      for (const id of idsToUpdate) {
        await this.#seatoolWriteService.respondToRai({
          id,
          spwStatus,
          timestamp,
          raiReceivedDate,
          raiToRespondTo,
          raiWithdrawnDate,
        });
        await this.#makoWriteService.respondToRai({
          action,
          id,
          topicName,
          responseDate,
          ...data,
        });
      }

      await this.#seatoolWriteService.trx.commit();
    } catch (err: unknown) {
      await this.#seatoolWriteService.trx.rollback();

      console.error(err);
    }
  }

  async toggleRaiResponseWithdraw(data: ToggleRaiResponseDto) {
    try {
      const idsToUpdate = await this.#getIdsToUpdate(data.id);

      for (const id of idsToUpdate) {
        await this.#makoWriteService.toggleRaiResponseWithdraw({
          ...data,
          id,
        });
      }
    } catch (err: unknown) {
      console.error(err);
    }
  }
}
