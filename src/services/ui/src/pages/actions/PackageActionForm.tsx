import { Navigate, useParams } from "@/components/Routing";
import { useGetItem, useGetPackageActions } from "@/api";
import {
  Alert,
  BreadCrumbs,
  LoadingSpinner,
  SimplePageContainer,
} from "@/components";
import { detailsAndActionsCrumbs } from "@/pages/actions/actions-breadcrumbs";
import React, {
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
} from "react";

type CloneableChild = ReactElement<any, string | JSXElementConstructor<any>>;

export const PackageActionForm = ({ children }: PropsWithChildren) => {
  const { id, type } = useParams("/action/:id/:type");
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

  if (!id || !type) return <Navigate path="/" />;
  if (itemIsLoading || actionsAreLoading) return <LoadingSpinner />;
  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={detailsAndActionsCrumbs({ id: id, action: type })}
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
