import { useEffect, useState } from "react";
import { Alert, AlertVariant } from "../Alert";
import { Check, X } from "lucide-react";
import { useLocation } from "react-router-dom";
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
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);
  const { pathname } = useLocation();

  const onClose = () => {
    bannerState.dismiss();
  };

  useEffect(() => {
    const unsubscribe = bannerState.subscribe((banner) => {
      if (banner) {
        setActiveBanner(banner);
      } else {
        setActiveBanner(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (activeBanner && activeBanner.pathnameToDisplayOn !== pathname) {
      onClose();
    }
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
