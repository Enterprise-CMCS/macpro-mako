import { useForm, Controller } from "react-hook-form";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactQueryApiError } from "shared-types";
import { Button } from "@/components/Inputs";
import { useState } from "react";
import { getUserStateCodes } from "@/utils";
import { useGetUser } from "@/api/useGetUser";
import { useParams } from "react-router-dom";
import { SubNavHeader } from "@/components";

type FormData = {
  id: string;
  authority: string;
  state: string;
};

export const getSubmissionData = async (props: FormData): Promise<any> => {
  const results = await API.post("os", "/submit", {
    body: props,
  });
  console.log(results);
  return results;
};

export const useCreateSeatoolRecord = (
  options?: UseMutationOptions<any, ReactQueryApiError, FormData>
) => {
  return useMutation<any, ReactQueryApiError, FormData>(
    (props) => getSubmissionData(props),
    options
  );
};

export const Create = () => {
  const { authority } = useParams();

  console.log(authority);
  const { data: user } = useGetUser();
  const stateCodes = getUserStateCodes(user?.user);
  const { handleSubmit, control } = useForm<FormData>();
  const { mutate } = useCreateSeatoolRecord();
  const [dropDownValue, setDropDownValue] = useState("");

  const onSubmit = (data: FormData) => {
    const newData: FormData = {
      ...data,
      id: `${dropDownValue}-${data.id}`,
      state: dropDownValue,
      // authority: authority!.split("-").join(" "),
      // This will become dynamic again once forms are introduced (KH)
      authority: "medicaid spa",
    };
    mutate(newData);
  };

  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Initial Submission</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col space-y-2">
            <label htmlFor="state" className="text-gray-600 font-semibold">
              State:
            </label>
            <Controller
              name="state"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="relative">
                  <select
                    {...field}
                    value={dropDownValue}
                    onChange={(val) => setDropDownValue(val.target.value)}
                    id="state"
                    className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  >
                    <option key=" " value=""></option>
                    {stateCodes.map((VAL) => (
                      <option key={VAL} value={VAL}>
                        {VAL}
                      </option>
                    ))}
                    {/* Add more state options as needed */}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 6.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            />
          </div>
          <div className="my-4">
            <label htmlFor="id" className="block text-gray-700">
              ID:
            </label>
            <div className="flex items-center">
              <input
                type="text"
                readOnly
                value={dropDownValue}
                className="w-12 text-center px-3 py-2 placeholder-gray-300 border rounded-sm focus:ring focus:ring-indigo-300 focus:border-indigo-400 outline-none"
              />
              <div className="mx-2 text-3xl">-</div>
              <Controller
                name="id"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="id"
                    placeholder={"Enter an ID"}
                    className="w-full px-3 py-2 placeholder-gray-300 border rounded-sm focus:ring focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                  />
                )}
              />
            </div>
          </div>

          {/* <div className="mb-4">
            <label htmlFor="authority" className="block text-gray-700">
              Authority:
            </label>
            <Controller
              name="authority"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="authority"
                  placeholder="Enter Authority"
                  className="w-full px-3 py-2 placeholder-gray-300 border rounded-sm focus:ring focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                />
              )}
            />
          </div> */}

          <Button className="mt-4" type="submit">
            Submit
          </Button>
        </form>
      </section>
    </>
  );
};
