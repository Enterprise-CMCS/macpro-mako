import {
  DefaultGenerics,
  Outlet,
  ReactLocation,
  Route,
  Router,
} from "@tanstack/react-location";
import { Home } from "./pages/Home";
import { Posts } from "./pages/Posts";
import { Header } from "./components/Header";
import { useQueryClient } from "@tanstack/react-query";
import { getPosts } from "./hooks/queries/useGetPosts";
import { Post } from "./pages/Post";
import { getPostById } from "./hooks/queries/useGetPostById";

const location = new ReactLocation();

export const AppRouter = () => {
  const queryClient = useQueryClient();

  const routes: Route<DefaultGenerics>[] = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/posts",
      element: <Posts />,
      loader: () =>
        queryClient.getQueryData(["posts"]) ??
        queryClient.fetchQuery(["posts"], getPosts),
      children: [
        {
          path: "/",
          element: <h1>Select a post</h1>,
        },
        {
          path: ":postId",
          loader: ({ params: { postId } }) =>
            queryClient.getQueryData(["posts", postId]) ??
            queryClient.fetchQuery(["posts", postId], () =>
              getPostById(postId)
            ),
          element: <Post />,
        },
      ],
    },
  ];

  return (
    <>
      <Router location={location} routes={routes}>
        <Header />
        <Outlet />
      </Router>
    </>
  );
};
