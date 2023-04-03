import {
  DefaultGenerics,
  Outlet,
  ReactLocation,
  Route,
  Router,
} from "@tanstack/react-location";
import * as Page from "./pages";
import { MainWrapper } from "./components";
import { useQueryClient } from "@tanstack/react-query";
import { getPostById } from "./hooks/queries/useGetPostById";
import { getPosts } from "./api/useGetPosts";

const location = new ReactLocation();

export const AppRouter = () => {
  const queryClient = useQueryClient();

  const routes: Route<DefaultGenerics>[] = [
    {
      path: "/",
      element: <Page.Home />,
    },
    {
      path: "/posts",
      element: <Page.Posts />,
      loader: () =>
        queryClient.getQueryData(["posts"]) ??
        queryClient.fetchQuery(["posts"], getPosts),
      children: [
        {
          path: "/",
          element: <p>Posts page content</p>,
        },
        {
          path: ":postId",
          loader: ({ params: { postId } }) =>
            queryClient.getQueryData(["posts", postId]) ??
            queryClient.fetchQuery(["posts", postId], () =>
              getPostById(postId)
            ),
          element: <Page.Post />,
        },
      ],
    },
  ];

  return (
    <>
      <Router location={location} routes={routes}>
        <MainWrapper>
          <Outlet />
        </MainWrapper>
      </Router>
    </>
  );
};
