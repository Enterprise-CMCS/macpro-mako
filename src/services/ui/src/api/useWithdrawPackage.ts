import { PackageActionURL } from "@/lib";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { Action, ReactQueryApiError } from "shared-types";

type WithdrawPackageResponse = {
    body: {
        message: string;
    };
}

const url: PackageActionURL = `/action/${Action.WITHDRAW_PACKAGE}`;
const withdrawPackage = async (
    id: string
): Promise<WithdrawPackageResponse> =>
    await API.post("os", url, { body: { id } });

export const useWithdrawPackage = (id: string, options?: UseMutationOptions<WithdrawPackageResponse, ReactQueryApiError>) => {
    return useMutation<WithdrawPackageResponse, ReactQueryApiError>(
        ["", id],
        () => withdrawPackage(id),
        options
    );
};
