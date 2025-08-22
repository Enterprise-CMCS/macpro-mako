import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { Webform } from "./Webform";

const meta = {
  title: "Webforms/Webform",
  component: Webform,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/webform/:id/:version",
      },
    }),
  },
} satisfies Meta<typeof Webform>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ABP1: Story = {
  name: "ABP1.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp1", version: "202401" },
      },
    }),
  },
};

export const ABP1_2: Story = {
  name: "ABP1.v202402",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp1", version: "202402" },
      },
    }),
  },
};

export const ABP2a: Story = {
  name: "ABP2a.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp2a", version: "202401" },
      },
    }),
  },
};

export const ABP2b: Story = {
  name: "ABP2b.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp2b", version: "202401" },
      },
    }),
  },
};

export const ABP2c: Story = {
  name: "ABP2c.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp2c", version: "202401" },
      },
    }),
  },
};

export const ABP3: Story = {
  name: "ABP3.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp3", version: "202401" },
      },
    }),
  },
};

export const ABP3_1: Story = {
  name: "ABP3_1.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp3_1", version: "202401" },
      },
    }),
  },
};

export const ABP4: Story = {
  name: "ABP4.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp4", version: "202401" },
      },
    }),
  },
};

export const ABP5: Story = {
  name: "ABP5.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp5", version: "202401" },
      },
    }),
  },
};

export const ABP6: Story = {
  name: "ABP6.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp6", version: "202401" },
      },
    }),
  },
};

export const ABP7: Story = {
  name: "ABP7.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp7", version: "202401" },
      },
    }),
  },
};

export const ABP9: Story = {
  name: "ABP9.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp9", version: "202401" },
      },
    }),
  },
};

export const ABP10: Story = {
  name: "ABP10.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp10", version: "202401" },
      },
    }),
  },
};

export const ABP11: Story = {
  name: "ABP11.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "abp11", version: "202401" },
      },
    }),
  },
};

export const CS3: Story = {
  name: "CS3.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "cs3", version: "202401" },
      },
    }),
  },
};

export const CS7: Story = {
  name: "CS7.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "cs7", version: "202401" },
      },
    }),
  },
};

export const CS8: Story = {
  name: "CS8.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "cs8", version: "202401" },
      },
    }),
  },
};

export const G1: Story = {
  name: "G1.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "g1", version: "202401" },
      },
    }),
  },
};

export const G2a: Story = {
  name: "G2a.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "g2a", version: "202401" },
      },
    }),
  },
};

export const G2b: Story = {
  name: "G2b.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "g2b", version: "202401" },
      },
    }),
  },
};

export const G3: Story = {
  name: "G3.v202401",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "g3", version: "202401" },
      },
    }),
  },
};
