import { Navigate, Outlet } from "react-router";

import { useGetUserDetails } from "@/api";

const UserManagementGuard = () => {
  const { data: userDetails, isLoading } = useGetUserDetails();

  if (isLoading) return null;

  const allowedRoles = ["systemadmin", "statesystemadmin", "cmsroleapprover", "helpdesk"];

  const canView = allowedRoles.includes(userDetails?.role);

  return canView ? <Outlet /> : <Navigate to="/404" replace />;
};

export { UserManagementGuard };
