import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "shared-utils";

import { RoleRequest, useGetRoleRequests, useSubmitRoleRequests } from "@/api";
import {
  ConfirmationDialog,
  LoadingSpinner,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SubNavHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import { cn } from "@/utils";
type StatusType = "active" | "pending" | "denied" | "revoked";
export type UserRoleType = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  territory: string;
  doneByName: string;
  lastModifiedDate: number;
  status: StatusType;
  eventType: string;
};
type headingType = { [key: string]: keyof UserRoleType | null };

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
const initSortUserData = (userData: UserRoleType[]) => {
  if (!userData.length) return [];
  // seprate pending / other
  const pendingRoles = userData.filter((x: UserRoleType) => x.status === "pending");
  const remainingRoles = userData.filter((x: UserRoleType) => x.status !== "pending");

  const compare = (a: UserRoleType, b: UserRoleType) => {
    const nameA = a.fullName.toLocaleLowerCase();
    const nameB = b.fullName.toLocaleLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  };
  const sorted = pendingRoles.sort(compare).concat(remainingRoles.sort(compare));

  return sorted;
};
const sortUserData = (sortByKey: keyof UserRoleType, dirrection: boolean, data: UserRoleType[]) => {
  // when dirrection is true, that means we are decending
  const [last, first] = dirrection ? [-1, 1] : [1, -1];
  const sortStatus = (a: UserRoleType, b: UserRoleType) => {
    switch (a.status) {
      case "pending":
        return first;
      case "active":
        return b.status === "pending" ? last : first;
      case "denied":
        return b.status === "revoked" ? first : last;
      case "revoked":
        return last;
      default:
        return last;
    }
  };
  const mainSort = (a: UserRoleType, b: UserRoleType) =>
    a[sortByKey] < b[sortByKey] ? first : last;

  if (sortByKey === "status") return data.sort((a, b) => sortStatus(a, b));

  return data.sort((a, b) => mainSort(a, b));
};

export const renderCellActions = (
  userRole: UserRoleType,
  setModalText: React.Dispatch<React.SetStateAction<string>>,
  setSelectedUserRole: React.Dispatch<React.SetStateAction<object>>,
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
    }
  })();
  const actionChosen = (action: string) => {
    const modalAction = {
      "Grant Access": "grant",
      "Deny Access": "deny",
      "Revoke Access": "revoke",
    };

    const requestFor = userRole.status === "pending" ? " request for" : "";
    //  in legacy there is logic to add the territory in front
    setModalText(
      `This will ${modalAction[action]} ${userRole.fullName}'s${requestFor} access to OneMac.`,
    );
    setSelectedUserRole({
      email: userRole.email,
      state: userRole.territory,
      role: userRole.role,
      grantAccess: modalAction[action] === "grant",
      eventType: userRole.eventType,
    });
  };
  return (
    <Popover>
      <PopoverTrigger
        disabled={!actions.length}
        className="block ml-3"
        aria-label="Available actions"
      >
        <EllipsisVerticalIcon
          aria-label="record actions"
          className={cn("w-8 ", actions.length ? "text-blue-700" : "text-gray-400")}
        />
      </PopoverTrigger>
      <PopoverContent>
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
  const { data, isLoading, isFetching } = useGetRoleRequests();
  const { mutateAsync: submitRequest, isLoading: processSubmit } = useSubmitRoleRequests();
  const [userRoles, setUserRoles] = useState<UserRoleType[]>([]);
  const [selectedUserRole, setSelectedUserRole] = useState<RoleRequest>(null);

  const [sortBy, setSortBy] = useState<{
    title: keyof headingType | "";
    direction: boolean;
  }>({ title: "", direction: false });
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
    }
  };

  // const headings: headingType = {
  //   Actions: null,
  //   Name: "fullName",
  //   Status: "status",
  //   "Last Modified": "lastModifiedDate",
  //   "Modified By": "doneByName",
  // };

  const headings = useMemo(
    () => ({
      Actions: null,
      Name: "fullName",
      Status: "status",
      "Last Modified": "lastModifiedDate",
      "Modified By": "doneByName",
    }),
    [],
  );

  const sortByHeading = (heading: string) => {
    if (heading === "Actions") return;

    let direction = false;
    if (sortBy.title === heading) {
      setSortBy({ title: heading, direction: !sortBy.direction });
      direction = !sortBy.direction;
    } else setSortBy({ title: heading, direction: false });
    setUserRoles(sortUserData(headings[heading], direction, userRoles));
  };

  // useEffect(() => {
  //   if (data && data.length && data[0]) {
  //     const sortedRoles = initSortUserData(JSON.parse(data));
  //     setUserRoles(sortedRoles);
  //   }
  // }, [data]);

  const parsedUserRoles: UserRoleType[] = useMemo(() => {
    if (!data || !data.length) return [];
    return initSortUserData(data);
  }, [data]);

  const sortedUserRoles = useMemo(() => {
    if (!sortBy.title) return parsedUserRoles;
    return sortUserData(headings[sortBy.title], sortBy.direction, parsedUserRoles);
  }, [parsedUserRoles, sortBy, headings]);

  return (
    <div>
      <ConfirmationDialog
        open={modalText !== null}
        title="Modify User's Access?"
        body={modalText}
        acceptButtonText="Confirm"
        aria-labelledby="Modify User's Access Modal"
        onAccept={async () => {
          submitRequest(selectedUserRole);
          setModalText(null);
          setSelectedUserRole(null);
        }}
        onCancel={() => setModalText(null)}
      />
      <SubNavHeader>
        <h1 className="text-xl font-medium">User Management</h1>
      </SubNavHeader>
      <div className="py-5 px-10">
        {(isLoading || processSubmit || isFetching) && <LoadingSpinner />}
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
            {sortedUserRoles.map((userRole) => {
              return (
                <TableRow key={userRole.id}>
                  <TableCell className="py-5 px-4">
                    {renderCellActions(userRole, setModalText, setSelectedUserRole)}
                  </TableCell>
                  <TableCell>{userRole.fullName}</TableCell>
                  <TableCell>
                    <span className="font-semibold flex items-center">
                      {renderStatus(userRole.status)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(userRole.lastModifiedDate)}</TableCell>
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
