import { useGetRoleRequests } from "@/api";

export const UserManagement = () => {
  const { data } = useGetRoleRequests();
  console.log(data, "data??");
  return <div>hi</div>;
};
