import { useGetUser } from "@/api/useGetUser";
import { Alert, SubNavHeader } from "@/components";
import { Button } from "@/components/Inputs";
import { RoleDescriptionStrings } from "shared-types";
import config from "@/config";

export const Profile = () => {
  const { data } = useGetUser();

  // Returns comma-separated string of user role descriptions:
  function rolesDescriptions(roles: string | undefined) {
    const rolesArray: string[] | undefined = roles?.split(",");

    const descriptiveRolesArray = rolesArray?.map((role) => {
      return RoleDescriptionStrings[role];
    });

    if (descriptiveRolesArray) {
      return descriptiveRolesArray.join(", ");
    }
  }

  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">My Profile</h1>
      </SubNavHeader>

      <section className="block max-w-screen-xl m-auto px-4 lg:px-8 py-8 gap-10">
        <Alert className="mb-6 bg-sky-100 flex flex-row">
          <div className="py-1 mr-2 flex-none w-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="py-2 flex-1">
            All changes to your access or profile must be made in IDM.
          </div>
          <a href={config.idm.home_url} target="_blank" rel="noreferrer">
            <Button variant="outline">Go to IDM</Button>
          </a>
        </Alert>

        <div className="basis-1/2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold">My Information</h2>

          <div className="leading-9">
            <h3 className="font-bold">Full Name</h3>
            <p>
              {data?.user?.given_name} {data?.user?.family_name}
            </p>
          </div>

          <div className="leading-9">
            <h3 className="font-bold">Role</h3>
            <p>{rolesDescriptions(data?.user?.["custom:cms-roles"])}</p>
          </div>

          <div className="leading-9">
            <h3 className="font-bold">Email</h3>
            <p>{data?.user?.email}</p>
          </div>
        </div>
      </section>
    </>
  );
};
