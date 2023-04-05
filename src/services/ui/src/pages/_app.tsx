import type { AppProps } from "next/app";
import "@enterprise-cmcs/macpro-ux-lib/build/assets/css/index.css";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const DynamicMainWrapper = dynamic(
  () => import("../components/MainWrapper/index"),
  { ssr: false }
);

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DynamicMainWrapper>
        <Component {...pageProps} />;
      </DynamicMainWrapper>
    </QueryClientProvider>
  );
}
