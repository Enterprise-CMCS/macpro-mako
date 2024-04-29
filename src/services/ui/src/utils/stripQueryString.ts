export const stripQueryStringFromURL = (path: string) => {
  const [strippedPath, queryString] = path.split("?");

  const params = Object.fromEntries(new URLSearchParams(queryString).entries());

  return {
    path: strippedPath,
    queryParams: params,
  };
};
