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
    const modalAction: Record<string, string> = {
      "Grant Access": "grant",
      "Deny Access": "deny",
      "Revoke Access": "revoke",
    };

    const requestFor = userRole.status === "pending" ? " request for" : "";

    const statusMap: Record<string, UserRoleType["status"]> = {
      "Grant Access": "active",
      "Deny Access": "denied",
      "Revoke Access": "revoked",
    };

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

  const isDisabled = isPopoverDisabled || actions.length === 0;

  return (
    <Popover>
      <PopoverTrigger disabled={isDisabled} aria-label="Available actions">
        <EllipsisVerticalIcon
          aria-label="record actions"
          className={cn("w-8", isDisabled ? "text-gray-400 cursor-not-allowed" : "text-blue-700")}
        />
      </PopoverTrigger>

      {!isDisabled && (
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
      )}
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
  const [modalText, setModalText] = useState<string | null>(null);

  const isHelpDesk = userDetails?.role === "helpdesk";
  const isStateSystemAdmin = userDetails?.role === "statesystemadmin";
  const isSystemAdmin = userDetails?.role === "systemadmin";
  const isCmsRoleApprover = userDetails?.role === "cmsroleapprover";

  // Policy: SSAs can manage users, just not other parallel SSA accounts.
  const canManageUsers = isSystemAdmin || isStateSystemAdmin || isCmsRoleApprover;

  const [sortBy, setSortBy] = useState<{ title: keyof headingType | ""; direction: boolean }>({
    title: "",
    direction: false,
  });

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

    if (!isStateSystemAdmin) return { Actions: null, ...baseHeadings };

    // state sys admin view removes State/Role columns
    delete baseHeadings.State;
    delete baseHeadings.Role;
    return { Actions: null, ...baseHeadings };
  }, [isHelpDesk, isStateSystemAdmin]);

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

  const sortByHeading = (heading: string) => {
    if (heading === "Actions") return;

    let direction = false;
    if (sortBy.title === heading) {
      direction = !sortBy.direction;
      setSortBy({ title: heading, direction });
    } else {
      setSortBy({ title: heading, direction: false });
    }

    setUserRoles((prev) => (prev ? sortUserData(headings[heading], direction, prev) : prev));
  };

  useEffect(() => {
    if (!data) return;
    if (!data.length) {
      setUserRoles([]);
      return;
    }

    if (sortBy.title) {
      setUserRoles(sortUserData(headings[sortBy.title], sortBy.direction, [...data]));
    } else {
      setUserRoles(initSortUserData([...data]));
    }
  }, [data, sortBy, headings]);

  const stateSystemAdminEmails = useMemo(() => {
    if (!userRoles) return new Set<string>();
    return new Set(
      userRoles
        .filter((role) => role.role === "statesystemadmin" && role.status === "active")
        .map((role) => role.email),
    );
  }, [userRoles]);

  const visibleUserRoles = useMemo(() => {
    if (!userRoles) return [];
    if (!isStateSystemAdmin) return userRoles;

    return userRoles.filter(
      (r) => r.role !== "statesystemadmin" && !stateSystemAdminEmails.has(r.email),
    );
  }, [userRoles, isStateSystemAdmin, stateSystemAdminEmails]);

  const getBannerText = (selectedUser: SelectedUser) => {
    switch (selectedUser.grantAccess) {
      case "active":
        return `${selectedUser.fullName} has been granted access`;
      case "denied":
        return `${selectedUser.fullName} has been denied access`;
      case "revoked":
        return `${selectedUser.fullName}'s access has been revoked`;
      default:
        return `${selectedUser.fullName}'s access is pending`;
    }
  };

  const applyLocalStatusUpdate = (updated: SelectedUser) => {
    const now = Date.now();

    setUserRoles((prev) => {
      if (!prev) return prev;
      return prev.map((r) => {
        if (r.email !== updated.email || r.territory !== updated.state || r.role !== updated.role) {
          return r;
        }

        return {
          ...r,
          status: updated.grantAccess,
          lastModifiedDate: now,
          doneByName: userDetails?.fullName ?? r.doneByName,
          doneByEmail: userDetails?.email ?? r.doneByEmail,
        };
      });
    });

    queryClient.setQueryData<UserRoleType[]>(["roleRequests"], (old) => {
      if (!old) return old;
      return old.map((r) => {
        if (r.email !== updated.email || r.territory !== updated.state || r.role !== updated.role) {
          return r;
        }
        return {
          ...r,
          status: updated.grantAccess,
          lastModifiedDate: now,
          doneByName: userDetails?.fullName ?? r.doneByName,
          doneByEmail: userDetails?.email ?? r.doneByEmail,
        };
      });
    });
  };

  const onAcceptRoleChange = async () => {
    try {
      setModalText(null);

      await submitRequest(selectedUserRole);
      applyLocalStatusUpdate(selectedUserRole);

      await queryClient.invalidateQueries({ queryKey: ["roleRequests"], refetchType: "none" });

      banner({
        header: "Status Change",
        body: `${getBannerText(selectedUserRole)}, a notification has been sent to their email.`,
        variant: "success",
        pathnameToDisplayOn: window.location.pathname,
      });

      setSelectedUserRole(null);
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
    const modifiedUserRoles =
      visibleUserRoles.map((role) => ({
        Name: role.fullName,
        Email: role.email,
        State: role.territory,
        Status: role.status,
        Role: userRoleMap[role.role],
        ["Last Modified"]: formatDate(role.lastModifiedDate),
        ["Modified By"]: role.doneByName,
      })) ?? [];

    const csvExporter = new ExportToCsv({
      useKeysAsHeaders: true,
      filename: `Role-Requests-${formatDate(Date.now())}`,
    });

    csvExporter.generateCsv(modifiedUserRoles);
  };

  if (!userDetails || isLoading || processSubmit || isFetching || !userRoles) {
    return <LoadingSpinner />;
  }

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
            {visibleUserRoles.map((userRole) => {
              const isActorStateSystemAdmin = userDetails.role === "statesystemadmin";
              const isTargetStateSystemAdmin = stateSystemAdminEmails.has(userRole.email);
              const isParallelSsaBlocked = isActorStateSystemAdmin && isTargetStateSystemAdmin;
              const isPopoverDisabled =
                !canManageUsers ||
                isParallelSsaBlocked ||
                (!["systemadmin", "cmsroleapprover"].includes(userDetails.role) &&
                  userRole.territory?.toLocaleUpperCase() !== "N/A" &&
                  !userDetails.states?.includes(userRole.territory));

              return (
                <TableRow key={userRole.id}>
                  {canManageUsers && (
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
                      to={`/profile/${LZ.compressToEncodedURIComponent(userRole.email).replaceAll(
                        "+",
                        "_",
                      )}`}
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
