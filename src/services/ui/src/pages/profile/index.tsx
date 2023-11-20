import { useGetUser } from "@/api/useGetUser";

export const Profile = () => {
  const { isLoading, isError, data } = useGetUser();

  console.info(data?.user?.["custom:state"]);

  return (
    <>
      <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
        <h1 className="text-2xl font-bold">My Information</h1>

        <h2 className="font-bold">Full Name</h2>
        <p>
          {data?.user?.given_name} {data?.user?.family_name}
        </p>

        <h2 className="font-bold">Role</h2>
        <p>{data?.user?.["custom:cms-roles"]}</p>

        <h2 className="font-bold">Email</h2>
        <p>{data?.user?.email}</p>

        <h2 className="font-bold">Phone number</h2>
      </div>

      {data?.user?.["custom:state"]}
    </>
  );
};
