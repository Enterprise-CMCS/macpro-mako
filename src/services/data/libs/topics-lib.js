import * as _ from "lodash";
import { Kafka, ConfigResourceTypes } from "kafkajs";

export async function createTopics(brokerString, topicsConfig) {
  const topics = topicsConfig;
  const brokers = brokerString.split(",");

  const kafka = new Kafka({
    clientId: "admin",
    brokers: brokers,
    ssl: true,
  });
  var admin = kafka.admin();

  const create = async () => {
    await admin.connect();

    //fetch topics from MSK and filter out __ internal management topic
    const existingTopicList = _.filter(await admin.listTopics(), function (n) {
      return !n.startsWith("_");
    });

    console.log("Existing topics:", JSON.stringify(existingTopicList, null, 2));

    //fetch the metadata for the topics in MSK
    const topicsMetadata = _.get(
      await admin.fetchTopicMetadata({ topics: existingTopicList }),
      "topics",
      {}
    );
    console.log("Topics Metadata:", JSON.stringify(topicsMetadata, null, 2));

    //diff the existing topics array with the topic configuration collection
    const topicsToCreate = _.differenceWith(
      topics,
      existingTopicList,
      (topicConfig, topic) => _.get(topicConfig, "topic") == topic
    );

    //find interestion of topics metadata collection with topic configuration collection
    //where partition count of topic in Kafka is less than what is specified in the topic configuration collection
    //...can't remove partitions, only add them
    const topicsToUpdate = _.intersectionWith(
      topics,
      topicsMetadata,
      (topicConfig, topicMetadata) =>
        _.get(topicConfig, "topic") == _.get(topicMetadata, "name") &&
        _.get(topicConfig, "numPartitions") >
          _.get(topicMetadata, "partitions", []).length
    );

    //create a collection to update topic paritioning
    const paritionConfig = _.map(topicsToUpdate, function (topic) {
      return {
        topic: _.get(topic, "topic"),
        count: _.get(topic, "numPartitions"),
      };
    });

    //create a collection to allow querying of topic configuration
    const configOptions = _.map(topicsMetadata, function (topic) {
      return {
        name: _.get(topic, "name"),
        type: _.get(ConfigResourceTypes, "TOPIC"),
      };
    });

    //query topic configuration
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

    //create topics that don't exist in MSK
    await admin.createTopics({ topics: topicsToCreate });

    //if any topics have less partitions in MSK than in the configuration, add those partitions
    paritionConfig.length > 0 &&
      (await admin.createPartitions({ topicPartitions: paritionConfig }));

    await admin.disconnect();
  };

  await create();
}

export async function deleteTopics(brokerString, topicList) {
  // Check that each topic in the list is something we can delete
  for (var topic of topicList) {
    if (!topic.match(/.*--.*--.*--.*/g)) {
      throw "ERROR:  The deleteTopics function only operates against topics that match /.*--.*--.*--.*/g";
    }
  }

  const brokers = brokerString.split(",");

  const kafka = new Kafka({
    clientId: "admin",
    brokers: brokers,
    ssl: true,
    requestTimeout: 295000, // 5s short of the lambda function's timeout
  });
  var admin = kafka.admin();

  await admin.connect();

  const currentTopics = await admin.listTopics();

  let topicsToDelete = _.filter(currentTopics, function (currentTopic) {
    return topicList.some((pattern) => {
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
