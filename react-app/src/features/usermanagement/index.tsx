import { useGetRoleRequests } from "@/api";

export const UserManagement = () => {
  const { data, error } = useGetRoleRequests();
  console.log(error, "ERROR??");
  return <div>hi</div>;
};
