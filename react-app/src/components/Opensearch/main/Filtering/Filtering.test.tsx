import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { useSpaTableColumns } from "@/features/dashboard/Lists/spas/consts";
import userEvent from "@testing-library/user-event";
import { OsMainView } from "@/components/Opensearch/";
import { OsProvider } from "@/components/Opensearch/";
import {
  MemoryRouter,
} from "react-router-dom";
import { ContextState } from "@/components/Opensearch/";
import { Authority } from "shared-types";
const mockContextState: ContextState = {
  data: {
    total: {
      value: 2140,
      relation: "eq",
    },
    max_score: null,
    hits: [
      {
        _index: "change-eye-iconmain",
        _id: "MD-24-5555-PB",
        _score: null,
        _source: {
          id: "MD-24-5555-PB",
          changedDate: "2024-01-11T18:05:58.450Z",
          statusDate: "2024-01-11T13:05:58.017Z",
          subject: "Test",
          description: "checking ",
          leadAnalystName: "Jeff Branch",
          raiReceivedDate: "2024-01-02T00:00:00.000Z",
          raiRequestedDate: "2024-01-02T00:00:00.000Z",
          leadAnalystOfficerId: 3547,
          proposedDate: "2024-01-02T00:00:00.000Z",
          state: "MD",
          raiWithdrawnDate: "2024-01-02T00:00:00.000Z",
          finalDispositionDate: "2024-01-11T13:05:58.017Z",
          stateStatus: "Approved",
          types: [
            {
              SPA_TYPE_ID: 8,
              SPA_TYPE_NAME: "1915(k) Waivers Do Not Use",
            },
          ],
          subTypes: [
            {
              TYPE_ID: 48,
              TYPE_NAME: "Community First Choice Do Not Use",
            },
          ],
          submissionDate: "2024-01-02T00:00:00.000Z",
          cmsStatus: "Approved",
          reviewTeam: ["Padma Test"],
          flavor: "MEDICAID",
          authorityId: 125,
          initialIntakeNeeded: false,
          authority: Authority.MED_SPA,
          approvedEffectiveDate: "2024-01-10T00:00:00.000Z",
          seatoolStatus: "Approved",
          raiWithdrawEnabled: false,
          secondClock: false,
          appkParentId: null,
          additionalInformation: "Medicaid SPA primary submission",
          attachments: [
            {
              bucket: "om-uploads-master-attachments-635052997545",
              filename: "Defects_Val_RETesting_1182023.docx",
              uploadDate: 1704219642903,
              title: "CMS Form 179",
              key: "c3610c72-06f0-4c29-a46e-7984ac950c6f",
            },
            {
              bucket: "om-uploads-master-attachments-635052997545",
              filename: "BMP-TEST.bmp",
              uploadDate: 1704219642903,
              title: "SPA Pages",
              key: "9c9c0c80-b01d-4897-af97-81e78f5a8d6a",
            },
          ],
          originalWaiverNumber: "OH-8301.R00.21",
          actionType: "sample",
          actionTypeId: 2,
          legacySubmissionTimestamp: "HELLO",
          origin: "OneMAC",
          makoChangedDate: "2024-01-02T18:57:06.762Z",
          submitterName: "George Harrison",
          submitterEmail: "george@example.com",
        },
        sort: [0],
      },
    ],
  },
  isLoading: false,
  error: null,
};

// vi.mock("@/components/Opensearch/main/index.tsx", () => ({
//   onToggle: vi.fn()
//   // .mockReturnValue([
//   //   {
//   //     field: "state.keyword",
//   //     label: "State",
//   //   },
//   //   {
//   //     field: "authority.keyword",
//   //     label: "Authority",
//   //     hidden: true,
//   //   },
//   //   {
//   //     field: "stateStatus.keyword",
//   //     label: "Status",
//   //     hidden: true,
//   //   },
//   // ]),
// }));

vi.mock("@/features/dashboard/Lists/spas/consts.tsx", () => ({
  useSpaTableColumns: vi.fn().mockReturnValue([
    {
      field: "state.keyword",
      label: "State",
    },
    {
      field: "authority.keyword",
      label: "Authority",
    },
    {
      field: "stateStatus.keyword",
      label: "Status",
      hidden: true,
    },
  ]),
}));

// vi.mock("@/api/useGetUser.ts", async () => {
//   const actual = await vi.importActual('@/api/useGetUser.ts');
//   return {
//     ...actual,
//     getUser: vi.fn().mockResolvedValue({
//       isCms: false,
//       user: {
//         email: "fakeemail@.com",
//         email_verified: true,
//         family_name: "family",
//         username: "hello",
//         sub: "what",
//         given_name: "confused",
//         "custom:cms-roles": "onemac-micro-helpdesk",
//         "custom:state": "CA",
//       } satisfies CognitoUserAttributes,
//     })
//   }
// });

// const mockOnToggle = (field: string) => {
//   useSpaTableColumns().map((col) => {
//     if (col.field !== field) return col;
//     return { ...col, hidden: !col.hidden };
//   })
// }

describe("Visibility button", () => {
  beforeEach(() => {
    // const onToggle = vi.fn();
    vi.mock("@/api/useGetUser.ts", async () => {
      const actual = await vi.importActual('@/api/useGetUser.ts');
      return {
        // ...actual,
        useGetUser: vi.fn().mockResolvedValue({ data: 'hello'})
        // getUser: vi.fn().mockResolvedValue({
        //   isCms: false,
        //   user: {
        //     email: "fakeemail@.com",
        //     email_verified: true,
        //     family_name: "family",
        //     username: "hello",
        //     sub: "what",
        //     given_name: "confused",
        //     "custom:cms-roles": "onemac-micro-helpdesk",
        //     "custom:state": "CA",
        //   } satisfies CognitoUserAttributes,
        // })
      }
    });
    // render(
    //   <QueryClientProvider client={new QueryClient()}>
    //     <OsProvider value={mockContextState}>
    //       <MemoryRouter initialEntries={["/dashboard"]}>
    //         {/* <FilterDrawerProvider> */}
    //           {/* <OsFiltering columns={useSpaTableColumns()} onToggle={onToggle} /> */}
    //           <OsMainView columns={useSpaTableColumns()}/>
    //         {/* </FilterDrawerProvider> */}
    //       </MemoryRouter>
    //     </OsProvider>
    //   </QueryClientProvider>
    // );
    render(
      <OsProvider value={mockContextState}>
        <MemoryRouter initialEntries={["/dashboard"]}>
        <OsMainView columns={useSpaTableColumns()}/>
        </MemoryRouter>
      </OsProvider>
    )
  });

  test("Visibility button should show number of hidden columns", async () => {
    // const onToggle = vi.fn();
    // render(
    //   <VisibilityPopover
    //     list={useSpaTableColumns().filter((COL) => !COL.locked || COL.field)}
    //     onItemClick={onToggle}
    //     hiddenColumns={useSpaTableColumns().filter(
    //       (COL) => COL.hidden === true,
    //     )}
    //   />,
    // );
    expect(screen.getByText("Columns (1 hidden)")).toBeInTheDocument();
  });

  test("Visibility button functionality", async () => {
    // render(
    //   <VisibilityPopover
    //     list={useSpaTableColumns().filter((COL) => !COL.locked || COL.field)}
    //     onItemClick={onToggle}
    //     hiddenColumns={useSpaTableColumns().filter(
    //       (COL) => COL.hidden === true,
    //     )}
    //   />,
    // );
    await userEvent.click(screen.getByText("Columns (1 hidden)"));
    expect(screen.getByText("State")).toBeInTheDocument();
    const stateButton = screen.getByText("State")
    await userEvent.click(stateButton);
    console.log(stateButton, 'button skadsdlkfsdf')
    // expect(onToggle).toHaveBeenCalledWith("state.keyword")
    await waitFor(() => screen.getByText("Columns 2 hidden"));
    // expect(screen.getByText("Columns (2 hidden)")).toBeInTheDocument();
  });
});
