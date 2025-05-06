import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { OneMacUserProfile, UserDetails } from "@/api";
import { LoadingSpinner } from "@/components";

export const UserProfile = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {}, [params, params.profileId]);

  if (isLoading) return <LoadingSpinner />;

  return <div />;
};
