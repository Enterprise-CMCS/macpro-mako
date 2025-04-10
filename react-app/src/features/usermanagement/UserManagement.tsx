import { useEffect, useState } from "react";
import { formatDate } from "shared-utils";

import { useGetRoleRequests } from "@/api";
import {
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

export const UserManagement = () => {
  const { data } = useGetRoleRequests();
  const [userRoles, setUserRoles] = useState<UserRoleType[]>([]);

  const renderStatus = (value: string) => {
    switch (value) {
      case "pending":
        return <span className="flex items-center">{pendingCircle} Pending</span>;
      case "active":
        return "Granted";
      case "denied":
        return "Denied";
      case "revoked":
        return "Revoked";
    }
  };

  useEffect(() => {
    console.log("in useEffect - data: ", data);

    if (data && data.length && data[0]) {
      setUserRoles(JSON.parse(data));
    }
  }, [data]);

  // console.log(data, "data??");
  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">User Management</h1>
      </SubNavHeader>
      <div className="py-5 px-10">
        <Table>
          <TableHeader className="[&_tr]:border-b sticky top-0 bg-white">
            <TableRow className="border-b transition-colors hover:bg-muted/50 text-sm">
              <TableHead className="py-5 px-2">Name</TableHead>
              <TableHead className="py-5 px-2">Status</TableHead>
              <TableHead className="py-5 px-2">Last Modified</TableHead>
              <TableHead className="py-5 px-2">Modified By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((userRole) => {
              return (
                <TableRow key={userRole.id}>
                  <TableCell>{userRole.fullName}</TableCell>
                  <TableCell>{renderStatus(userRole.status)}</TableCell>
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
