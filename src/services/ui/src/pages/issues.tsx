import { useForm } from "react-hook-form";

export function Issues() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-screen-lg mt-4 mx-auto p-8"
    >
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
          Title
        </label>
        <input
          {...register("title", { required: true })}
          id="title"
          type="text"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.title ? "border-red-500" : ""
          }`}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">Title is required</p>
        )}
      </div>
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-gray-700 font-bold mb-2"
        >
          Description
        </label>
        <textarea
          {...register("description", { required: true })}
          id="description"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.description ? "border-red-500" : ""
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">Description is required</p>
        )}
      </div>
      <div className="mb-4">
        <label
          htmlFor="priority"
          className="block text-gray-700 font-bold mb-2"
        >
          Priority
        </label>
        <select
          {...register("priority")}
          id="priority"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="" disabled selected>
            -- select --
          </option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="type" className="block text-gray-700 font-bold mb-2">
          Type
        </label>
        <select
          {...register("type")}
          id="type"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="" disabled selected>
            -- select --
          </option>
          <option value="look">Look</option>
          <option value="functionality">Functionality</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mb-4">
        <label
          htmlFor="resolved"
          className="block text-gray-700 font-bold mb-2"
        >
          <input
            {...register("resolved")}
            id="resolved"
            type="checkbox"
            className="mr-2 leading-tight"
          />
          <span className="text-sm">Resolved</span>
        </label>
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit
      </button>
    </form>
  );
}
