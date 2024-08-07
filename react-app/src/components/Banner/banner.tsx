import { useEffect, useState } from "react";
import { Alert, AlertVariant } from "../Alert";
import { Check, X } from "lucide-react";
import { useLocation } from "react-router-dom";

export type Banner = {
  header: string;
  body: string;
  variant?: AlertVariant;
  pathnameToDisplayOn: string;
};

class Observer {
  subscribers: Array<(banner: Banner) => void>;
  banner: Banner | null;

  constructor() {
    this.subscribers = [];
    this.banner = null;
  }

  subscribe = (subscriber: (banner: Banner | null) => void) => {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  private publish = (data: Banner | null) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  create = (data: Banner) => {
    this.publish(data);
    this.banner = { ...data };
  };

  dismiss = () => {
    this.publish(null);
    this.banner = null;
  };
}

const bannerState = new Observer();

export const banner = (newBanner: Banner) => {
  return bannerState.create(newBanner);
};

export const Banner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const { pathname } = useLocation();

  const onClose = () => {
    bannerState.dismiss();
  };

  useEffect(() => {
    const unsubscribe = bannerState.subscribe((banner) => {
      if (banner) {
        setBanner(banner);
      } else {
        setBanner(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (banner && banner.pathnameToDisplayOn !== pathname) {
      onClose();
    }
  }, [pathname, banner]);

  if (banner === null) {
    return null;
  }

  return (
    <Alert variant={banner.variant} className="mt-4 mb-8 flex-row text-sm">
      <div className="flex items-start justify-between">
        <Check />
        <div className="ml-2 w-full">
          <h3 className="text-lg font-bold">{banner.header}</h3>
          <p>{banner.body}</p>
        </div>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>
    </Alert>
  );
};
