import * as _ from "lodash";
import { Kafka, ConfigResourceTypes, Admin } from "kafkajs";

export async function createTopics(brokerString: string, topicsConfig: any[]) {
  const topics: string[] = topicsConfig.map((topic) => topic.topic);
  const brokers: string[] = brokerString.split(",");

  const kafka = new Kafka({
    clientId: "admin",
    brokers: brokers,
    ssl: true,
  });
  const admin: Admin = kafka.admin();

  const create = async () => {
    await admin.connect();

    const existingTopicList: string[] = _.filter(
      await admin.listTopics(),
      function (n: string) {
        return !n.startsWith("_");
      }
    );

    console.log("Existing topics:", JSON.stringify(existingTopicList, null, 2));

    const topicsMetadata = _.get(
      await admin.fetchTopicMetadata({ topics: existingTopicList }),
      "topics",
      {}
    );
    console.log("Topics Metadata:", JSON.stringify(topicsMetadata, null, 2));

    const topicsToCreate = _.differenceWith(
      topics,
      existingTopicList,
      (topicConfig: any, topic: string) => _.get(topicConfig, "topic") == topic
    );

    const topicsToUpdate = _.intersectionWith(
      topics,
      topicsMetadata,
      (topicConfig: any, topicMetadata: any) =>
        _.get(topicConfig, "topic") == _.get(topicMetadata, "name") &&
        _.get(topicConfig, "numPartitions") >
          _.get(topicMetadata, "partitions", []).length
    );

    const paritionConfig = _.map(topicsToUpdate, function (topic: any) {
      return {
        topic: _.get(topic, "topic"),
        count: _.get(topic, "numPartitions"),
      };
    });

    const configOptions = _.map(topicsMetadata, function (topic: any) {
      return {
        name: _.get(topic, "name"),
        type: _.get(ConfigResourceTypes, "TOPIC"),
      };
    });

    const configs =
      configOptions.length != 0
        ? await admin.describeConfigs({ resources: configOptions })
        : [];

    console.log("Topics to Create:", JSON.stringify(topicsToCreate, null, 2));
    console.log("Topics to Update:", JSON.stringify(topicsToUpdate, null, 2));
    console.log(
      "Partitions to Update:",
      JSON.stringify(paritionConfig, null, 2)
    );
    console.log(
      "Topic configuration options:",
      JSON.stringify(configs, null, 2)
    );

    await admin.createTopics({ topics: topicsToCreate });

    paritionConfig.length > 0 &&
      (await admin.createPartitions({ topicPartitions: paritionConfig }));

    await admin.disconnect();
  };

  await create();
}

export async function deleteTopics(brokerString: string, topicList: string[]) {
  for (const topic of topicList) {
    if (!topic.match(/.*--.*--.*--.*/g)) {
      throw "ERROR:  The deleteTopics function only operates against topics that match /.*--.*--.*--.*/g";
    }
  }

  const brokers: string[] = brokerString.split(",");

  const kafka = new Kafka({
    clientId: "admin",
    brokers: brokers,
    ssl: true,
    requestTimeout: 295000,
  });
  const admin: Admin = kafka.admin();

  await admin.connect();

  const currentTopics: string[] = await admin.listTopics();

  const topicsToDelete = _.filter(currentTopics, function (currentTopic: string) {
    return topicList.some((pattern: string) => {
      return !!currentTopic.match(pattern);
    });
  });

  console.log(`Deleting topics:  ${topicsToDelete}`);
  await admin.deleteTopics({
    topics: topicsToDelete,
    timeout: 295000,
  });

  await admin.disconnect();
}
