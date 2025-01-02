import { useEffect, useRef, useState } from "react";
import { Alert, AlertVariant } from "../Alert";
import { Check, X } from "lucide-react";
import { useLocation } from "react-router";
import { Observer } from "@/utils/basic-observable";

export type Banner = {
  header: string;
  body: string;
  variant?: AlertVariant;
  pathnameToDisplayOn: string;
};

class BannerObserver extends Observer<Banner> {
  create = (data: Banner) => {
    this.publish(data);
    this.observed = { ...data };
  };

  dismiss = () => {
    this.publish(null);
    this.observed = null;
  };
}

const bannerState = new BannerObserver();

export const banner = (newBanner: Banner) => {
  return bannerState.create(newBanner);
};

export const Banner = () => {
  const bannerObserverRef = useRef<(() => void) | null>(null);

  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);
  const { pathname } = useLocation();
  const previousPathRef = useRef(pathname);

  const onClose = () => {
    bannerState.dismiss();
  };

  useEffect(() => {
    if (bannerObserverRef.current === null) {
      bannerObserverRef.current = bannerState.subscribe((banner) => {
        setActiveBanner(banner);
      });

      return () => {
        bannerObserverRef.current?.();
        bannerObserverRef.current = null;
      };
    }
  }, []);

  useEffect(() => {
    // only run cleanup if:
    // 1. we've actually navigated (pathname changed from previous render)
    // 2. there's an active banner to clean up
    // 3. the banner's target pathname doesn't match where we navigated to
    if (pathname !== previousPathRef.current) {
      if (activeBanner && activeBanner.pathnameToDisplayOn !== pathname) {
        onClose();
      }
    }

    // store current pathname for next render's comparison
    previousPathRef.current = pathname;
  }, [pathname, activeBanner]);

  if (activeBanner && activeBanner.pathnameToDisplayOn === pathname) {
    return (
      <Alert variant={activeBanner.variant} className="mt-4 mb-8 flex-row text-sm">
        <div className="flex items-start justify-between">
          <Check />
          <div className="ml-2 w-full">
            <h3 className="text-lg font-bold" data-testid="banner-header">
              {activeBanner.header}
            </h3>
            <p data-testid="banner-body">{activeBanner.body}</p>
          </div>
          <button onClick={onClose} data-testid="banner-close">
            <X size={20} />
          </button>
        </div>
      </Alert>
    );
  }

  return null;
};
