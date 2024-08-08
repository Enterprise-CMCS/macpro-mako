import { handler } from "./defs";
import {
  updateAVDefinitonsWithFreshclam,
  uploadAVDefinitions,
  cleanupFolder,
  FRESHCLAM_WORK_DIR,
} from "./../lib";
import { expect, test, vi } from "vitest";

vi.mock("pino", () => {
  return {
    default: vi.fn().mockReturnValue({
      info: vi.fn(),
      error: vi.fn(),
    }),
  };
});

vi.mock("./../lib", () => ({
  updateAVDefinitonsWithFreshclam: vi.fn(),
  uploadAVDefinitions: vi.fn(),
  cleanupFolder: vi.fn(),
  FRESHCLAM_WORK_DIR: "/path/to/work/dir",
}));

test("should update AV definitions successfully", async () => {
  (cleanupFolder as any).mockResolvedValueOnce(undefined);
  (updateAVDefinitonsWithFreshclam as any).mockResolvedValueOnce(true);
  (uploadAVDefinitions as any).mockResolvedValueOnce(undefined);

  const result = await handler();

  expect(cleanupFolder).toHaveBeenCalledWith(FRESHCLAM_WORK_DIR);
  expect(updateAVDefinitonsWithFreshclam).toHaveBeenCalled();
  expect(uploadAVDefinitions).toHaveBeenCalled();
  expect(result).toBe("DEFINITION UPDATE SUCCESS");
});
