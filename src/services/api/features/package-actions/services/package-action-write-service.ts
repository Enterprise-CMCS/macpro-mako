import { z } from "zod";
import {
  BigmacWriteService,
  WithdrawEnabledParams,
} from "./bigmac-write-service";
import { SeatoolWriteService } from "./seatool-write-service";
import { raiIssueSchema } from "shared-types";
import { KafkaService } from "@/shared/onemac-micro-kafka";
import * as sql from "mssql";
import { KafkaConfig } from "kafkajs";
import * as query from "@/features/package-actions/queries";

type IPackageActionWriteService = {
  issueRai: (rai: z.infer<typeof raiIssueSchema>) => Promise<void>;
  enableRaiWithdraw: (params: WithdrawEnabledParams) => Promise<void>;
  respondToRai: (params: query.RespondToRaiQueryParams) => Promise<void>;
  withdrawRai: (params: query.WithdrawRaiQueryParams) => Promise<void>;
};

export class PackageActionWriteService implements IPackageActionWriteService {
  private readonly bigmacWriteService: BigmacWriteService;
  private readonly seatoolWriteService: SeatoolWriteService;

  constructor(bigmac: BigmacWriteService, seatool: SeatoolWriteService) {
    this.bigmacWriteService = bigmac;
    this.seatoolWriteService = seatool;
  }

  static async createPackageActionWriteService(
    kafkaConfig: KafkaConfig,
    mssqlConfig: sql.config,
    topicName: string
  ) {
    const kafkaInstance = new KafkaService(kafkaConfig);
    const seatoolInstance = await sql.connect(mssqlConfig);

    const bigmacService = new BigmacWriteService(kafkaInstance, topicName);
    const seatoolService = new SeatoolWriteService(seatoolInstance);

    return new PackageActionWriteService(bigmacService, seatoolService);
  }

  async issueRai(rai: z.infer<typeof raiIssueSchema>) {
    await this.bigmacWriteService.issueRai(rai);
    await this.seatoolWriteService.issueRai(rai);
  }

  async enableRaiWithdraw(params: WithdrawEnabledParams) {
    await this.bigmacWriteService.setWithdrawEnabled(params);
  }

  async changePackageStatus(params: query.ChangePackageStatusQueryParams) {
    await this.seatoolWriteService.changePackageStatus(params);
  }

  async respondToRai(params: query.RespondToRaiQueryParams) {
    await this.seatoolWriteService.respondToRai(params);
  }

  async withdrawRai(params: query.WithdrawRaiQueryParams) {
    await this.seatoolWriteService.withdrawRai(params);
  }
}
