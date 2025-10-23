import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asCmsRoleApprover, asHelpDesk, asStateSystemAdmin } from "../../../.storybook/decorators";
import { UserManagement } from "./UserManagement";

const meta = {
  title: "Feature/User Management",
  component: UserManagement,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/usermanagement",
      },
    }),
  },
} satisfies Meta<typeof UserManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateUser: Story = {
  name: "State System Admin",
  decorators: [asStateSystemAdmin],
};

export const CmsUser: Story = {
  name: "CMS Role Approver",
  decorators: [asCmsRoleApprover],
};

export const HelpDeskUser: Story = {
  name: "Help Desk User",
  decorators: [asHelpDesk],
};
