import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { ErrorMessage } from "@hookform/error-message";
import { CreateIssue, createIssueSchema } from "shared-types";
import { useCreateIssue } from "../../api";
import { useNavigate } from "react-router-dom";

export function AddIssueForm({ callback }: { callback?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIssue>({ resolver: zodResolver(createIssueSchema) });
  const { isLoading, mutateAsync, error } = useCreateIssue();
  const navigate = useNavigate();
  const onSubmit = async (data: CreateIssue) => {
    try {
      await mutateAsync(data);
      navigate("/issues");
      if (callback) {
        callback();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-screen-lg mx-auto w-96"
    >
      <>
        {error &&
          error.messages.map(({ message }) => (
            <div className="mt-4" key={message}>
              <UI.Alert
                alertBody={message}
                alertHeading="Error"
                variation="error"
              />
            </div>
          ))}
        <div className="max-w-md">
          <div className="my-4">
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
            <ErrorMessage
              errors={errors}
              name="title"
              render={({ message }) => (
                <UI.Typography className="text-red-500 text-xs mt-1">
                  {message}
                </UI.Typography>
              )}
            />
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
            <ErrorMessage
              errors={errors}
              name="description"
              render={({ message }) => (
                <UI.Typography className="text-red-500 text-xs mt-1">
                  {message}
                </UI.Typography>
              )}
            />
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
              defaultValue=""
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.priority ? "border-red-500" : ""
              }`}
            >
              <option value="" disabled>
                -- select --
              </option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <ErrorMessage
              errors={errors}
              name="priority"
              render={({ message }) => (
                <UI.Typography className="text-red-500 text-xs mt-1">
                  {message}
                </UI.Typography>
              )}
            />
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
            <ErrorMessage
              errors={errors}
              name="type"
              render={({ message }) => (
                <UI.Typography className="text-red-500 text-xs mt-1">
                  {message}
                </UI.Typography>
              )}
            />
          </div>
          <UI.Button
            buttonText={isLoading ? "Loading" : "Submit"}
            type="submit"
            className="float-right"
            disabled={isLoading}
          />
        </div>
      </>
    </form>
  );
}
