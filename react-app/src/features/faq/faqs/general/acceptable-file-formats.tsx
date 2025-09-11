import { FILE_TYPES } from "shared-types/uploads";

export const AcceptableFileFormats = () => (
  <section>
    <p>
      We accept the following file formats under 80 MB in size.{" "}
      <i>Unfortunately, we are unable to accept .zip or compressed files.</i>
    </p>
    <h3 className="text-bold pt-4 pb-4">Acceptable File Formats</h3>
    <table className="table-auto border-collapse border border-gray-300 w-full ">
      <tbody>
        {FILE_TYPES.map(({ extension, description }, index) => (
          <tr key={index}>
            <td className="pr-8 text-bold  border border-gray-300 px-4 py-2 ">{extension}</td>
            <td className="border border-gray-300 px-4 py-2">{description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);
