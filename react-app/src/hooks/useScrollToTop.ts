import { useEffect } from "react";

export const useScrollToTop = (dependency = null) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [dependency]);
};
