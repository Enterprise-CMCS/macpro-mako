import { describe, expect, it, vi } from "vitest";
import { errorApiUserProfileHandler } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import * as gaModule from "@/utils/ReactGA/SendGAEvent";
import { getUserProfile } from "./useGetUserProfile";
vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
    sendGAEvent: vi.fn(),
}));
describe("getUserProfile tests", () => {
    it("should return stateAccess on success", async () => {
        const profile = await getUserProfile();
        expect(profile).toEqual({
            stateAccess: expect.any(Array),
        });
    });

    it("should send a GA event and return empty object on error", async () => {
        mockedServer.use(errorApiUserProfileHandler);

        const profile = await getUserProfile();
        expect(profile).toEqual({});

        expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
            "api_error",
            expect.objectContaining({
                message: "failure /getUserDetails",
            }),
        );
    });
});
