import { mockedAdmin, TOPIC_ONE, TOPIC_THREE } from "mocks/helpers/kafka.utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createTopics, deleteTopics } from "./topics-lib";

describe("topics-lib test", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Creates and modifies existing topics", async () => {
    await createTopics("", [
      {
        topic: TOPIC_ONE,
        numPartitions: 2,
      },
      {
        topic: TOPIC_THREE,
        numPartitions: 2,
      },
      {
        topic: "topic-4--part1--section1--div3",
        numPartitions: 1,
      },
    ]);

    expect(mockedAdmin.createTopics).toBeCalledTimes(1);
    expect(mockedAdmin.createPartitions).toBeCalledTimes(1);
  });

  it("forwards retention config entries when creating topics", async () => {
    await createTopics("broker:9092", [
      {
        topic: "aws.onemac.migration.cdc",
        numPartitions: 1,
        configEntries: [{ name: "retention.ms", value: "-1" }],
      },
    ]);

    expect(mockedAdmin.createTopics).toHaveBeenCalledWith({
      topics: [
        expect.objectContaining({
          topic: "aws.onemac.migration.cdc",
          numPartitions: 1,
          configEntries: [{ name: "retention.ms", value: "-1" }],
        }),
      ],
    });
  });
  it("tries to delete existing topics fails for bad filename", async () => {
    await deleteTopics("", [TOPIC_ONE]);
    expect(mockedAdmin.deleteTopics).toBeCalledTimes(1);
  });
  it("deletes existing topics fails for bad filename", async () => {
    await expect(deleteTopics("", ["topic1"])).rejects.toThrowError(
      "ERROR: The deleteTopics function only operates against topics that match /.*--.*--.*--.*/g",
    );
  });
});
