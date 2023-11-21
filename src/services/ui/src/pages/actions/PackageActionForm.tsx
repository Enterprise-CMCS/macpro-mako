import { Navigate, useParams } from "react-router-dom";
import { useGetItem, useGetPackageActions } from "@/api";
import { ROUTES } from "@/routes";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SimplePageContainer,
} from "@/components";
import { DETAILS_AND_ACTIONS_CRUMBS } from "@/pages/actions/actions-breadcrumbs";
import { Action } from "shared-types";
import React, {
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
} from "react";

type CloneableChild = ReactElement<any, string | JSXElementConstructor<any>>;

export const PackageActionForm = ({ children }: PropsWithChildren) => {
  const { id, type } = useParams<{
    id: string;
    type: Action;
  }>();
  const {
    data: item,
    isLoading: itemIsLoading,
    error: itemError,
  } = useGetItem(id!);
  const {
    data: actions,
    isLoading: actionsAreLoading,
    error: actionsError,
  } = useGetPackageActions(id!);

  if (!id || !type) return <Navigate to={ROUTES.DASHBOARD} />;
  if (itemIsLoading || actionsAreLoading) return <LoadingSpinner />;
  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={DETAILS_AND_ACTIONS_CRUMBS({ id: id, action: type })}
      />
      {itemError && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR getting item: </strong>
          {itemError.response.data.message}
        </Alert>
      )}
      {actionsError && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR getting available actions: </strong>
          {actionsError.response.data.message}
        </Alert>
      )}
      {!actionsError && !actions?.actions.includes(type) && (
        <Alert className="my-2 max-w-2xl" variant="destructive">
          <strong>ERROR, invalid action: </strong>
          You cannot perform {type} on this package.
        </Alert>
      )}
      {!actionsError && !itemError && actions.actions.includes(type)
        ? React.Children.map(
            children as CloneableChild[],
            (child: CloneableChild) =>
              React.cloneElement(child, {
                // Child has to be configured to take these
                item,
              })
          )
        : null}
    </SimplePageContainer>
  );
};
