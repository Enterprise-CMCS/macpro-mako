import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  APP_K_1915C_ITEM_ID,
  CAP_INIT_1915B_ITEM_ID,
  CONTRACTING_INITIAL_ITEM_ID,
  NEW_CHIP_ITEM_ID,
  TEST_1915B_ITEM,
  TEST_1915C_ITEM,
  TEST_CHIP_SPA_ITEM,
  TEST_MED_SPA_ITEM,
} from "mocks";
import items from "mocks/data/items";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asCmsReviewer, asStateSubmitter } from "../../../../.storybook/decorators";
import { PostSubmissionWrapper } from "./post-submission-forms";

const meta = {
  title: "Form/Post Submission",
  component: PostSubmissionWrapper,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        loader: ({ params }) => {
          const { id } = params;
          switch (id) {
            case TEST_1915B_ITEM._id:
              return TEST_1915B_ITEM;
            case TEST_1915C_ITEM._id:
              return TEST_1915C_ITEM;
            case TEST_MED_SPA_ITEM._id:
              return TEST_MED_SPA_ITEM;
            case TEST_CHIP_SPA_ITEM._id:
              return TEST_CHIP_SPA_ITEM;
            case CONTRACTING_INITIAL_ITEM_ID:
              return items[CONTRACTING_INITIAL_ITEM_ID];
            case NEW_CHIP_ITEM_ID:
              return items[NEW_CHIP_ITEM_ID];
            case CAP_INIT_1915B_ITEM_ID:
              return items[CAP_INIT_1915B_ITEM_ID];
            case APP_K_1915C_ITEM_ID:
              return items[APP_K_1915C_ITEM_ID];
            default:
              return null;
          }
        },
        path: "/actions/:type/:authority/:id",
      },
    }),
  },
} satisfies Meta<typeof PostSubmissionWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Withdraw1915b: Story = {
  name: "Withdraw Package - 1915(b)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "withdraw-package", authority: "1915(b)", id: TEST_1915B_ITEM._id },
      },
    }),
  },
};

export const Withdraw1915c: Story = {
  name: "Withdraw Package - 1915(c)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "withdraw-package", authority: "1915(c)", id: TEST_1915C_ITEM._id },
      },
    }),
  },
};

export const WithdrawMedSpa: Story = {
  name: "Withdraw Package - Medicaid SPA",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "withdraw-package",
          authority: "Medicaid SPA",
          id: TEST_MED_SPA_ITEM._id,
        },
      },
    }),
  },
};

export const WithdrawChipSpa: Story = {
  name: "Withdraw Package - CHIP SPA",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "withdraw-package", authority: "CHIP SPA", id: TEST_CHIP_SPA_ITEM._id },
      },
    }),
  },
};

export const RespondToRai1915b: Story = {
  name: "Respond to RAI - 1915(b)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "respond-to-rai", authority: "1915(b)", id: TEST_1915B_ITEM._id },
      },
    }),
  },
};

export const RespondToRai1915c: Story = {
  name: "Respond to RAI - 1915(c)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "respond-to-rai", authority: "1915(c)", id: TEST_1915C_ITEM._id },
      },
    }),
  },
};

export const RespondToRaiMedSpa: Story = {
  name: "Respond to RAI - Medicaid SPA",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "respond-to-rai",
          authority: "Medicaid SPA",
          id: TEST_MED_SPA_ITEM._id,
        },
      },
    }),
  },
};

export const RespondToRaiChipSpa: Story = {
  name: "Respond to RAI - CHIP SPA",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "respond-to-rai", authority: "CHIP SPA", id: TEST_CHIP_SPA_ITEM._id },
      },
    }),
  },
};

export const WithdrawRai1915b: Story = {
  name: "Withdraw RAI - 1915(b)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "withdraw-rai", authority: "1915(b)", id: TEST_1915B_ITEM._id },
      },
    }),
  },
};

export const WithdrawRai1915c: Story = {
  name: "Withdraw RAI - 1915(c)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "withdraw-rai", authority: "1915(c)", id: TEST_1915C_ITEM._id },
      },
    }),
  },
};

export const WithdrawRaiMedSpa: Story = {
  name: "Withdraw RAI - Medicaid SPA",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "withdraw-rai",
          authority: "Medicaid SPA",
          id: TEST_MED_SPA_ITEM._id,
        },
      },
    }),
  },
};

export const WithdrawRaiChipSpa: Story = {
  name: "Withdraw RAI - CHIP SPA",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "withdraw-rai", authority: "CHIP SPA", id: TEST_CHIP_SPA_ITEM._id },
      },
    }),
  },
};

export const EnableRaiWithdraw1915b: Story = {
  name: "Enable RAI Withdraw - 1915(b)",
  decorators: [asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "enable-rai-withdraw", authority: "1915(b)", id: TEST_1915B_ITEM._id },
      },
    }),
  },
};

export const EnableRaiWithdraw1915c: Story = {
  name: "Enable RAI Withdraw - 1915(c)",
  decorators: [asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "enable-rai-withdraw", authority: "1915(c)", id: TEST_1915C_ITEM._id },
      },
    }),
  },
};

export const EnableRaiWithdrawMedSpa: Story = {
  name: "Enable RAI Withdraw - Medicaid SPA",
  decorators: [asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "enable-rai-withdraw",
          authority: "Medicaid SPA",
          id: TEST_MED_SPA_ITEM._id,
        },
      },
    }),
  },
};

export const EnableRaiWithdrawChipSpa: Story = {
  name: "Enable RAI Withdraw - CHIP SPA",
  decorators: [asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "enable-rai-withdraw",
          authority: "CHIP SPA",
          id: TEST_CHIP_SPA_ITEM._id,
        },
      },
    }),
  },
};

export const DisableRaiWithdraw1915b: Story = {
  name: "Disable RAI Withdraw - 1915(b)",
  decorators: [asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "disable-rai-withdraw", authority: "1915(b)", id: TEST_1915B_ITEM._id },
      },
    }),
  },
};

export const DisableRaiWithdraw1915c: Story = {
  name: "Disable RAI Withdraw - 1915(c)",
  decorators: [asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "disable-rai-withdraw", authority: "1915(c)", id: TEST_1915C_ITEM._id },
      },
    }),
  },
};

export const DisableRaiWithdrawMedSpa: Story = {
  name: "Disable RAI Withdraw - Medicaid SPA",
  decorators: [asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "disable-rai-withdraw",
          authority: "Medicaid SPA",
          id: TEST_MED_SPA_ITEM._id,
        },
      },
    }),
  },
};

export const DisableRaiWithdrawChipSpa: Story = {
  name: "Disable RAI Withdraw - CHIP SPA",
  decorators: [asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "disable-rai-withdraw",
          authority: "CHIP SPA",
          id: TEST_CHIP_SPA_ITEM._id,
        },
      },
    }),
  },
};

export const TempExt1915b: Story = {
  name: "Temporary Extension - 1915(b)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "temporary-extension", authority: "1915(b)", id: TEST_1915B_ITEM._id },
      },
    }),
  },
};

export const AmendWaiver1915b: Story = {
  name: "Amend Waiver - 1915(b)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { type: "amend-waiver", authority: "1915(b)", id: CONTRACTING_INITIAL_ITEM_ID },
      },
    }),
  },
};

export const UploadSubDoc1915b: Story = {
  name: "Upload Subsequent Documents - 1915(b)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "upload-subsequent-documents",
          authority: "1915(b)",
          id: CAP_INIT_1915B_ITEM_ID,
        },
      },
    }),
  },
};

export const UploadSubDoc1915c: Story = {
  name: "Upload Subsequent Documents - 1915(c)",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "upload-subsequent-documents",
          authority: "1915(c)",
          id: APP_K_1915C_ITEM_ID,
        },
      },
    }),
  },
};

export const UploadSubDocMedSpa: Story = {
  name: "Upload Subsequent Documents - Medicaid SPA",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "upload-subsequent-documents",
          authority: "Medicaid SPA",
          id: TEST_MED_SPA_ITEM._id,
        },
      },
    }),
  },
};

export const UploadSubDocChipSpa: Story = {
  name: "Upload Subsequent Documents - CHIP SPA",
  decorators: [asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          type: "upload-subsequent-documents",
          authority: "CHIP SPA",
          id: NEW_CHIP_ITEM_ID,
        },
      },
    }),
  },
};
