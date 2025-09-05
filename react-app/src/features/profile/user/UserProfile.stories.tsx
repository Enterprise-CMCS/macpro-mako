import type { Meta, StoryObj } from "@storybook/react-vite";
import LZ from "lz-string";
import { DEFAULT_CMS_USER_EMAIL, TEST_STATE_SUBMITTER_EMAIL } from "mocks";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asCmsRoleApprover, asStateSystemAdmin } from "../../../../.storybook/decorators";
import { UserProfile, userProfileLoader } from "./index";

const getProfileId = (userEmail: string) =>
  LZ.compressToEncodedURIComponent(userEmail).replaceAll("+", "_");

const meta = {
  title: "Feature/UserProfile",
  component: UserProfile,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        loader: userProfileLoader,
        path: "/profile/:profileId",
      },
    }),
  },
} satisfies Meta<typeof UserProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateUser: Story = {
  decorators: [asStateSystemAdmin],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { profileId: getProfileId(TEST_STATE_SUBMITTER_EMAIL) },
      },
    }),
  },
};

export const CmsUser: Story = {
  decorators: [asCmsRoleApprover],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { profileId: getProfileId(DEFAULT_CMS_USER_EMAIL) },
      },
    }),
  },
};
