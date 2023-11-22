import { useGetUser } from "@/api/useGetUser";
import { CardWithTopBorder } from "@/components";
import { UserRoles, UserRolesString } from "shared-types";

// Returns comma-separated string of user role descriptions:
function rolesDescriptions(roles: UserRolesString | undefined) {
  const rolesArray: string[] | undefined = roles?.split(",");
  console.log(rolesArray);

  const descriptiveRolesArray = rolesArray?.map((role) => {
    switch (role) {
      case UserRoles.CMS_READ_ONLY: {
        return "Read Only";
      }
      case UserRoles.CMS_REVIEWER: {
        return "Reviewer";
      }
      case UserRoles.HELPDESK: {
        return "Helpdesk";
      }
      case UserRoles.STATE_SUBMITTER: {
        return "State Submitter";
      }
    }
  });

  if (descriptiveRolesArray) {
    return descriptiveRolesArray.join(", ");
  }
}

export const Profile = () => {
  const { isLoading, isError, data } = useGetUser();

  console.info(data?.user);

  return (
    <>
      <div className="flex flex-row justify-center gap-8 max-w-screen-xl mx-auto p-4 py-8">
        <div className="basis-1/2 flex flex-col gap-6">
          <h1 className="text-2xl font-bold">My Information</h1>

          <div className="leading-9">
            <h2 className="font-bold">Full Name</h2>
            <p>
              {data?.user?.given_name} {data?.user?.family_name}
            </p>
          </div>

          <div className="leading-9">
            <h2 className="font-bold">Role</h2>
            <p>{rolesDescriptions(data?.user?.["custom:cms-roles"])}</p>
          </div>

          <div className="leading-9">
            <h2 className="font-bold">Email</h2>
            <p>{data?.user?.email}</p>
          </div>

          <div className="leading-9">
            <h2 className="font-bold">Phone number</h2>
            <p>555-555-5555</p>
            <p className="text-primary">
              <a href="" className="underline"></a>
            </p>
          </div>
        </div>
    </>
  );
};
