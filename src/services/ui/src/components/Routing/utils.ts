// import { Route } from "./types";

export function urlEmbedParams(path: any, params?: Record<string, any>) {
  if (!params) return path;

  return Object.entries(params).reduce((ACC, [KEY, VALUE]) => {
    const regex = new RegExp(`:${KEY}`);
    return ACC.replace(regex, `${VALUE}`);
  }, path);
}

export function urlEmbedQuery(path: string, query?: Record<string, any>) {
  if (!query) return path;
  const searchParams = new URLSearchParams(query);

  return `${path}?${searchParams.toString()}`;
}

export function urlEmbedHash(path: string, hash: string) {
  if (!hash) return path;

  return `${path}/#${hash}`;
}
