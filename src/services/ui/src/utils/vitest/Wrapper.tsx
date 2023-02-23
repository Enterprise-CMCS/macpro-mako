import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactLocation, Router } from "@tanstack/react-location";

const queryClient = new QueryClient();
const location = new ReactLocation();

export const Wrapper = ({ children }: any) => (
  <QueryClientProvider client={queryClient}>
    <Router location={location} routes={[]}>
      {children}
    </Router>
  </QueryClientProvider>
);
