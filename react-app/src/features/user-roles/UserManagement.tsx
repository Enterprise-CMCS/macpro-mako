import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { ExportToCsv } from "export-to-csv";
import LZ from "lz-string";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { formatDate, formatDateToET } from "shared-utils";
import { userRoleMap } from "shared-utils";

import { RoleRequest, useGetRoleRequests, useGetUserDetails, useSubmitRoleRequests } from "@/api";
import {
  banner,
  Button,
  ConfirmationDialog,
  LoadingSpinner,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import { cn } from "@/utils";

import { initSortUserData, sortUserData, UserRoleType } from "./utils";

type headingType = { [key: string]: keyof UserRoleType | null };

type SelectedUser = RoleRequest & { fullName: string };

const pendingCircle = (
  <svg
    className="mr-2"
    width="9"
    height="9"
    viewBox="0 0 9 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4.5" cy="4.5" r="4.5" fill="#3D94D0" />
  </svg>
);

export const renderCellActions = (
  userRole: UserRoleType,
  setModalText: React.Dispatch<React.SetStateAction<string>>,
  setSelectedUserRole: React.Dispatch<React.SetStateAction<object>>,
  isPopoverDisabled: boolean,
) => {
  const actions = (function () {
    switch (userRole.status) {
      case "pending":
        return ["Grant Access", "Deny Access"];
      case "active":
        return ["Revoke Access"];
      case "denied":
        return ["Grant Access"];
      case "revoked":
        return ["Grant Access"];
      default:
        return [];
    }
  })();

  const actionChosen = (action: string) => {
    const modalAction = {
      "Grant Access": "grant",
      "Deny Access": "deny",
      "Revoke Access": "revoke",
    } as const;

    const requestFor = userRole.status === "pending" ? " request for" : "";

    const statusMap = {
      "Grant Access": "active",
      "Deny Access": "denied",
      "Revoke Access": "revoked",
    } as const;

    setModalText(
      `This will ${modalAction[action]} ${userRole.fullName}'s${requestFor} access to OneMac.`,
    );
    setSelectedUserRole({
      email: userRole.email,
      fullName: userRole.fullName,
      state: userRole.territory,
      role: userRole.role,
      grantAccess: statusMap[action],
      eventType: userRole.eventType,
      group: userRole.group ?? null,
      division: userRole.division ?? null,
      requestRoleChange: false,
    });
  };

  return (
    <Popover>
      <PopoverTrigger
        disabled={isPopoverDisabled || !actions.length}
        aria-label="Available actions"
        className={cn(
          "block ml-3",
          isPopoverDisabled || !actions.length ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <EllipsisVerticalIcon
          aria-label="record actions"
          className={cn(
            "w-8",
            isPopoverDisabled || !actions.length ? "text-gray-400" : "text-blue-700",
          )}
        />
      </PopoverTrigger>

      <PopoverContent className="w-auto">
        <div className="flex flex-col">
          {actions.map((action, idx) => (
            <div
              className="text-blue-500 cursor-pointer relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              key={idx}
              onClick={() => actionChosen(action)}
            >
              {action}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const UserManagement = () => {
  const queryClient = useQueryClient();

  const { data: userDetails } = useGetUserDetails();
  const { data, isLoading, isFetching } = useGetRoleRequests();
  const { mutateAsync: submitRequest, isLoading: processSubmit } = useSubmitRoleRequests();

  const [userRoles, setUserRoles] = useState<UserRoleType[] | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<SelectedUser>(null);

  const isHelpDesk = !!userDetails && userDetails.role === "helpdesk";
  const isStateSystemAdmin = !!userDetails && userDetails.role === "statesystemadmin";
  const isSystemAdmin = !!userDetails && userDetails.role === "systemadmin";
  const isCmsRoleApprover = !!userDetails && userDetails.role === "cmsroleapprover";

  const canManageUsers = isSystemAdmin || isStateSystemAdmin || isCmsRoleApprover;

  const getBannerText = (selectedUser: SelectedUser) => {
    const getStatusText = () => {
      switch (selectedUser.grantAccess) {
        case "active":
          return " has been granted access";
        case "denied":
          return " has been denied access";
        case "revoked":
          return "'s access has been revoked";
        default:
          return "'s access is pending";
      }
    };
    return `${selectedUser.fullName}${getStatusText()}`;
  };

  const [sortBy, setSortBy] = useState<{ title: keyof headingType | ""; direction: boolean }>({
    title: "",
    direction: false,
  });
  const [modalText, setModalText] = useState<string | null>(null);

  const renderStatus = (value: string) => {
    switch (value) {
      case "pending":
        return <>{pendingCircle} Pending</>;
      case "active":
        return "Granted";
      case "denied":
        return "Denied";
      case "revoked":
        return "Revoked";
      default:
        return value;
    }
  };

  const headings = useMemo(() => {
    const baseHeadings: headingType = {
      Name: "fullName",
      State: "territory",
      Status: "status",
      Role: "role",
      "Last Modified": "lastModifiedDate",
      "Modified By": "doneByName",
    };

    if (isHelpDesk) return baseHeadings;

    // keep your existing behavior for state-system-admin column trimming
    if (!isStateSystemAdmin) return { Actions: null, ...baseHeadings };

    delete baseHeadings.State;
    delete baseHeadings.Role;
    return { Actions: null, ...baseHeadings };
  }, [isHelpDesk, isStateSystemAdmin]);

  const sortByHeading = (heading: string) => {
    if (heading === "Actions") return;

    let direction = false;
    if (sortBy.title === heading) {
      setSortBy({ title: heading, direction: !sortBy.direction });
      direction = !sortBy.direction;
    } else {
      setSortBy({ title: heading, direction: false });
    }

    setUserRoles(sortUserData(headings[heading], direction, userRoles));
  };

  useEffect(() => {
    if (data) {
      let sorted: UserRoleType[];
      if (sortBy.title) {
        sorted = sortUserData(headings[sortBy.title], sortBy.direction, [...data]);
      } else {
        sorted = initSortUserData([...data]);
      }
      setUserRoles(sorted);
    }
  }, [data, sortBy, headings]);

  const onAcceptRoleChange = async () => {
    try {
      setModalText(null);

      // snapshot for optimistic local patch
      const pendingUpdate = selectedUserRole;

      await submitRequest(selectedUserRole);
      setSelectedUserRole(null);

      // ✅ optimistic patch local table state (so UI updates instantly)
      setUserRoles((prev) => {
        if (!prev || !pendingUpdate) return prev;
        return prev.map((r) => {
          if (r.email !== pendingUpdate.email) return r;
          return {
            ...r,
            status: pendingUpdate.grantAccess,
            // if your API returns these fields, you can update them too
            // lastModifiedDate: Date.now(),
            // doneByName: userDetails?.fullName ?? r.doneByName,
          };
        });
      });

      // ✅ force fresh data from server
      await queryClient.invalidateQueries({ queryKey: ["roleRequests"] });
      await queryClient.refetchQueries({ queryKey: ["roleRequests"] });

      banner({
        header: "Status Change",
        body: `${getBannerText(pendingUpdate)}, a notification has been sent to their email.`,
        variant: "success",
        pathnameToDisplayOn: window.location.pathname,
      });

      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      banner({
        header: "An unexpected error has occurred:",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
    }
  };

  const handleExport = async () => {
    const modifiedUserRoles = userRoles.map((role) => ({
      Name: role.fullName,
      Email: role.email,
      State: role.territory,
      Status: role.status,
      Role: userRoleMap[role.role],
      ["Last Modified"]: formatDate(role.lastModifiedDate),
      ["Modified By"]: role.doneByName,
    }));

    const csvExporter = new ExportToCsv({
      useKeysAsHeaders: true,
      filename: `Role-Requests-${formatDate(Date.now())}`,
    });

    csvExporter.generateCsv(modifiedUserRoles);
  };

  if (!userDetails || isLoading || processSubmit || isFetching || !userRoles)
    return <LoadingSpinner />;

  return (
    <div>
      <ConfirmationDialog
        open={modalText !== null}
        title="Modify User's Access?"
        body={modalText}
        acceptButtonText="Confirm"
        aria-labelledby="Modify User's Access Modal"
        onAccept={onAcceptRoleChange}
        onCancel={() => setModalText(null)}
      />

      <div className="bg-sky-100/75" data-testid="sub-nav-header">
        <div className="max-w-screen-xl m-auto px-4 lg:px-8 flex items-center py-4 justify-between">
          <h1 className="text-xl font-medium">User Management</h1>
          {(isHelpDesk || isSystemAdmin) && (
            <Button variant="outline" onClick={handleExport}>
              Export to Excel (CSV)
            </Button>
          )}
        </div>
      </div>

      <div className="py-5 px-10">
        <Table>
          <TableHeader className="[&_tr]:border-b sticky top-0 bg-white">
            <TableRow className="border-b transition-colors hover:bg-muted/50 ">
              {Object.keys(headings).map((title) => (
                <TableHead
                  key={title}
                  className="py-5 px-2 font-bold cursor-pointer max-w-fit"
                  onClick={() => sortByHeading(title)}
                  isActive={sortBy.title === title}
                  desc={sortBy.direction}
                >
                  {title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {userRoles.map((userRole) => {
              const isPopoverDisabled =
                !canManageUsers ||
                (!["systemadmin", "cmsroleapprover"].includes(userDetails.role) &&
                  userRole.territory?.toLocaleUpperCase() !== "N/A" &&
                  !userDetails.states?.includes(userRole.territory));

              return (
                <TableRow key={userRole.id}>
                  {!isHelpDesk && (
                    <TableCell>
                      {renderCellActions(
                        userRole,
                        setModalText,
                        setSelectedUserRole,
                        isPopoverDisabled,
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    <Link
                      to={`/profile/${LZ.compressToEncodedURIComponent(userRole.email).replaceAll("+", "_")}`}
                      className="cursor-pointer text-blue-600 hover:underline flex select-none items-center px-2 py-2"
                    >
                      {userRole.fullName}
                    </Link>
                  </TableCell>

                  {!isStateSystemAdmin && <TableCell>{userRole.territory}</TableCell>}

                  <TableCell>
                    <span className="font-bold flex items-center">
                      {renderStatus(userRole.status)}
                    </span>
                  </TableCell>

                  {!isStateSystemAdmin && <TableCell>{userRoleMap[userRole.role]}</TableCell>}
                  <TableCell>{formatDateToET(userRole.lastModifiedDate)}</TableCell>
                  <TableCell>{userRole.doneByName}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
