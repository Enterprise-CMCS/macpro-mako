import { useEffect, useState } from "react";
import { formatDate } from "shared-utils";

import { useGetRoleRequests } from "@/api";
import {
  LoadingSpinner,
  SubNavHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";

type UserRoleType = {
  id: string;
  fullName: string;
  doneByName: string;
  lastModifiedDate: number;
  status: "active" | "pending" | "denied" | "revoked";
};
type headingType = { [key: string]: keyof UserRoleType };

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

const sortUserData = (sortByKey: keyof UserRoleType, dirrection: boolean, data: UserRoleType[]) => {
  // when dirrection is true, that means we are decending
  if (dirrection) {
    return data.sort((a, b) => (a[sortByKey] < b[sortByKey] ? 1 : -1));
  }
  data.sort((a, b) => (a[sortByKey] > b[sortByKey] ? 1 : -1));
  return data;
};

export const UserManagement = () => {
  const { data } = useGetRoleRequests();
  const [userRoles, setUserRoles] = useState<UserRoleType[]>([]);
  const [sortBy, setSortBy] = useState<{
    title: keyof headingType | "";
    dirrection: boolean;
  }>({ title: "", dirrection: false });

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

  const headings: headingType = {
    Name: "fullName",
    Status: "status",
    "Last Modified": "lastModifiedDate",
    ModifiedBy: "doneByName",
  };

  const sortByHeading = (heading: string) => {
    let dirrection = false;
    if (sortBy.title === heading) {
      setSortBy({ title: heading, dirrection: !sortBy.dirrection });
      dirrection = !sortBy.dirrection;
    } else setSortBy({ title: heading, dirrection: false });
    setUserRoles(sortUserData(headings[heading], dirrection, userRoles));
  };

  useEffect(() => {
    if (data && data.length && data[0]) {
      setUserRoles(JSON.parse(data));
    }
  }, [data]);

  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">User Management</h1>
      </SubNavHeader>
      <div className="py-5 px-10">
        {!userRoles.length && <LoadingSpinner />}
        <Table>
          <TableHeader className="[&_tr]:border-b sticky top-0 bg-white">
            <TableRow className="border-b transition-colors hover:bg-muted/50 ">
              {Object.keys(headings).map((title) => (
                <TableHead
                  key={title}
                  className="py-5 px-2 font-bold cursor-pointer max-w-fit"
                  onClick={() => sortByHeading(title)}
                  isActive={sortBy.title === title}
                  desc={sortBy.dirrection}
                >
                  {title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((userRole) => {
              return (
                <TableRow key={userRole.id}>
                  <TableCell className="py-5 px-2">{userRole.fullName}</TableCell>
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
