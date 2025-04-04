import { Link } from "react-router";

import { useGetAllForms } from "@/api";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";

import { SubNavHeader } from "../../components/Layout";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export const WebformsList = () => {
  const { data, isLoading } = useGetAllForms();

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Webforms</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div>
          <MaintenanceBanner />
          <table className="table-auto">
            <thead>
              <tr>
                <th>Form</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                Object.entries(data).map(([key, versions]) =>
                  versions.map((version) => (
                    <tr key={`${key}-${version}`}>
                      <td>
                        {key.slice(0, -1) +
                          (key.slice(-1).match(/[a-zA-Z]/)
                            ? key.slice(-1).toLowerCase()
                            : key.slice(-1))}
                      </td>{" "}
                      <td>{version}</td>
                      <td>
                        <Link
                          className="cursor-pointer text-blue-600"
                          to={`/webform/${key.toLowerCase()}/${version}`}
                        >
                          link
                        </Link>
                      </td>
                    </tr>
                  )),
                )}
            </tbody>
          </table>

          <div className="mt-2">
            <Link className="cursor-pointer text-blue-600 ml-0" to="/guides/abp">
              Implementation Guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
