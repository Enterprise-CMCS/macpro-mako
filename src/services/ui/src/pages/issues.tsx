import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { IssueSchema, issueSchema } from "../api/validators";

export function Issues() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueSchema>({ resolver: zodResolver(issueSchema) });

  const onSubmit = (data: IssueSchema) => {
    console.log(data);
  };

  console.log({ errors });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-screen-lg mx-auto px-8"
    >
      <div className="max-w-sm">
        <UI.Typography as="h1" size="lg">
          Add Issue
        </UI.Typography>
        <div className="mb-4">
          <label htmlFor="title">
            <UI.Typography as="p" size="sm" className="mb-2">
              Title
            </UI.Typography>
          </label>
          <input
            {...register("title")}
            id="title"
            type="text"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.title ? "border-red-500" : ""
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="description">
            <UI.Typography as="p" size="sm" className="mb-2">
              Description
            </UI.Typography>
          </label>
          <textarea
            {...register("description")}
            id="description"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.description ? "border-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="priority">
            <UI.Typography as="p" size="sm" className="mb-2">
              Priority
            </UI.Typography>
          </label>
          <select
            {...register("priority")}
            id="priority"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.priority ? "border-red-500" : ""
            }`}
          >
            <option value="" disabled selected>
              -- select --
            </option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {errors.priority && (
            <p className="text-red-500 text-xs mt-1">
              {errors.priority.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="type">
            <UI.Typography as="p" size="sm" className="mb-2">
              Type
            </UI.Typography>
          </label>
          <select
            {...register("type")}
            defaultValue=""
            id="type"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.type ? "border-red-500" : ""
            }`}
          >
            <option value="" disabled>
              -- select --
            </option>
            <option value="look">Look</option>
            <option value="functionality">Functionality</option>
            <option value="other">Other</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
          )}
        </div>
        <UI.Button buttonText="Submit" type="submit" className="float-right" />
      </div>
    </form>
  );
}
