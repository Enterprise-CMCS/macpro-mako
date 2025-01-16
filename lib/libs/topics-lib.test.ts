import { afterEach, describe, expect, it, vi } from "vitest";
import { createTopics, deleteTopics } from "./topics-lib";
import { mockedAdmin, TOPIC_ONE, TOPIC_THREE } from "mocks";

describe("topics-lib test", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Creates and modifies existing topics", async () => {
    const spyCreate = vi.spyOn(mockedAdmin, "createTopics");
    const spyUpdate = vi.spyOn(mockedAdmin, "createPartitions");
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

    expect(spyCreate).toBeCalledTimes(1);
    expect(spyUpdate).toBeCalledTimes(1);
  });
  it("tries to delete existing topics fails for bad filename", async () => {
    const spyDelete = vi.spyOn(mockedAdmin, "deleteTopics");
    await deleteTopics("", [TOPIC_ONE]);
    expect(spyDelete).toBeCalledTimes(1);
  });
  it("deletes existing topics fails for bad filename", async () => {
    await expect(deleteTopics("", ["topic1"])).rejects.toThrowError(
      "ERROR: The deleteTopics function only operates against topics that match /.*--.*--.*--.*/g",
    );
  });
});
