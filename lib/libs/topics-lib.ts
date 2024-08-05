import * as _ from "lodash";
import { Kafka, ConfigResourceTypes } from "kafkajs";

interface TopicConfig {
  topic: string;
  numPartitions: number;
  // Add other properties as needed
}

export async function createTopics(
  brokerString: string,
  topicsConfig: TopicConfig[]
) {
  const topics = topicsConfig;
  const brokers = brokerString.split(",");

  const kafka = new Kafka({
    clientId: "admin",
    brokers: brokers,
    ssl: true,
  });
  const admin = kafka.admin();

  const create = async () => {
    await admin.connect();

    // Fetch topics from MSK and filter out __ internal management topic
    const existingTopicList = _.filter(
      await admin.listTopics(),
      (n) => !n.startsWith("_")
    );

    console.log("Existing topics:", JSON.stringify(existingTopicList, null, 2));

    // Fetch the metadata for the topics in MSK
    const topicsMetadata = _.get(
      await admin.fetchTopicMetadata({ topics: existingTopicList }),
      "topics"
    );
    console.log("Topics Metadata:", JSON.stringify(topicsMetadata, null, 2));

    // Diff the existing topics array with the topic configuration collection
    const topicsToCreate = _.differenceWith(
      topics,
      existingTopicList,
      (topicConfig, topic) => _.get(topicConfig, "topic") === topic
    );

    // Find intersection of topics metadata collection with topic configuration collection
    // where partition count of topic in Kafka is less than what is specified in the topic configuration collection
    // ...can't remove partitions, only add them
    const topicsToUpdate = _.intersectionWith(
      topics,
      topicsMetadata,
      (topicConfig, topicMetadata) =>
        _.get(topicConfig, "topic") === _.get(topicMetadata, "name") &&
        _.get(topicConfig, "numPartitions") >
          _.get(topicMetadata, "partitions", []).length
    );

    // Create a collection to update topic partitioning
    const partitionConfig = _.map(topicsToUpdate, (topic) => ({
      topic: _.get(topic, "topic"),
      count: _.get(topic, "numPartitions"),
    }));

    // Create a collection to allow querying of topic configuration
    const configOptions = _.map(topicsMetadata, (topic) => ({
      name: _.get(topic, "name"),
      type: ConfigResourceTypes.TOPIC,
    }));

    // Query topic configuration
    const configs =
      configOptions.length !== 0
        ? await admin.describeConfigs({
            resources: configOptions,
            includeSynonyms: false,
          })
        : [];

    console.log("Topics to Create:", JSON.stringify(topicsToCreate, null, 2));
    console.log("Topics to Update:", JSON.stringify(topicsToUpdate, null, 2));
    console.log(
      "Partitions to Update:",
      JSON.stringify(partitionConfig, null, 2)
    );
    console.log(
      "Topic configuration options:",
      JSON.stringify(configs, null, 2)
    );

    // Create topics that don't exist in MSK
    await admin.createTopics({ topics: topicsToCreate });

    // If any topics have fewer partitions in MSK than in the configuration, add those partitions
    partitionConfig.length > 0 &&
      (await admin.createPartitions({ topicPartitions: partitionConfig }));

    await admin.disconnect();
  };

  await create();
}

export async function deleteTopics(brokerString: string, topicList: string[]) {
  // Check that each topic in the list is something we can delete
  for (const topic of topicList) {
    if (!topic.match(/.*--.*--.*--.*/g)) {
      throw new Error(
        "ERROR: The deleteTopics function only operates against topics that match /.*--.*--.*--.*/g"
      );
    }
  }

  const brokers = brokerString.split(",");

  const kafka = new Kafka({
    clientId: "admin",
    brokers: brokers,
    ssl: {
      rejectUnauthorized: false,
    },
    requestTimeout: 295000, // 5s short of the lambda function's timeout
  });
  const admin = kafka.admin();

  await admin.connect();

  const currentTopics = await admin.listTopics();

  const topicsToDelete = _.filter(currentTopics, (currentTopic) =>
    topicList.some((pattern) => !!currentTopic.match(pattern))
  );

  console.log(`Deleting topics: ${topicsToDelete}`);
  await admin.deleteTopics({
    topics: topicsToDelete,
    timeout: 295000,
  });

  await admin.disconnect();
}
