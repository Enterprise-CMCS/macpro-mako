export type KafkaEvent = {
  /**
   * @example "SelfManagedKafka"
   */
  eventSource: string;
  /**
   * @example: "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-2.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-3.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094"
   */
  bootstrapServers: string; // comma separated string
  records: Record<
    string,
    {
      topic: string;
      partition: number;
      offset: number;
      timestamp: number;
      timestampType: string;
      key: string;
      headers: string[];
      value: string;
    }[]
  >;
};
