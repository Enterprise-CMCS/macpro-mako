import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";

function MyApp({ Component, pageProps }: AppProps) {
  const AnyComponent = Component as any;
  return (
    <ChakraProvider>
      <AnyComponent {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
