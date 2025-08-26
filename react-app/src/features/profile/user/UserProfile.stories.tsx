import type { Meta, StoryObj } from "@storybook/react-vite";
import LZ from "lz-string";
import {
  CMS_ROLE_APPROVER_USERNAME,
  DEFAULT_CMS_USER_EMAIL,
  OS_STATE_SYSTEM_ADMIN_USERNAME,
  TEST_STATE_SUBMITTER_EMAIL,
} from "mocks";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asUser } from "../../../../.storybook/decorators";
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
  decorators: [asUser],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { profileId: getProfileId(TEST_STATE_SUBMITTER_EMAIL) },
      },
    }),
    username: OS_STATE_SYSTEM_ADMIN_USERNAME,
  },
};

export const CmsUser: Story = {
  decorators: [asUser],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { profileId: getProfileId(DEFAULT_CMS_USER_EMAIL) },
      },
    }),
    username: CMS_ROLE_APPROVER_USERNAME,
  },
};
