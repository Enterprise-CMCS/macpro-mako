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
import { getPosts } from "./api/useGetPosts";
import { getPost } from "./api/useGetPost";

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
            queryClient.fetchQuery(["posts", postId], () => getPost(postId)),
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
