import { Formik, FormikProps } from "formik";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSettingsState } from "../../../context/settings";
import { SwapFormValues } from "../../DTOs/SwapFormValues";
import { useSwapDataState, useSwapDataUpdate } from "../../../context/swap";
import React from "react";
import ConnectNetwork from "../../ConnectNetwork";
import toast from "react-hot-toast";
import MainStepValidation from "../../../lib/mainStepValidator";
import { generateSwapInitialValues } from "../../../lib/generateSwapInitialValues";
import LayerSwapApiClient from "../../../lib/layerSwapApiClient";
import Modal from "../../modal/modal";
import SwapForm from "./Form";
import { useRouter } from "next/router";
import useSWR from "swr";
import { ApiResponse } from "../../../Models/ApiResponse";
import { Partner } from "../../../Models/Partner";
import { UserType, useAuthDataUpdate } from "../../../context/authContext";
import { ApiError, LSAPIKnownErrorCode } from "../../../Models/ApiError";
import { resolvePersistantQueryParams } from "../../../helpers/querryHelper";
import { useQueryState } from "../../../context/query";
import TokenService from "../../../lib/TokenService";
import LayerSwapAuthApiClient from "../../../lib/userAuthApiClient";

type NetworkToConnect = {
    DisplayName: string;
    AppURL: string;
}

export default function Form() {
    const formikRef = useRef<FormikProps<SwapFormValues>>(null);
    const [showConnectNetworkModal, setShowConnectNetworkModal] = useState(false);
    const [networkToConnect, setNetworkToConnect] = useState<NetworkToConnect>();
    const router = useRouter();
    const { updateAuthData, setUserType } = useAuthDataUpdate()

    const settings = useSettingsState();
    const query = useQueryState()
    const { createSwap } = useSwapDataUpdate()

    const layerswapApiClient = new LayerSwapApiClient()
    const { data: partnerData } = useSWR<ApiResponse<Partner>>(query?.appName && `/apps?name=${query?.appName}`, layerswapApiClient.fetcher)
    const partner = query?.appName && partnerData?.data?.name?.toLowerCase() === (query?.appName as string)?.toLowerCase() ? partnerData?.data : undefined

    useEffect(() => {
        const initialValues = generateSwapInitialValues(settings, query)
        formikRef?.current?.resetForm({ values: initialValues })
        formikRef?.current?.validateForm(initialValues)
    }, [])

    const handleSubmit = useCallback(async (values: SwapFormValues) => {
        try {
            const accessToken = TokenService.getAuthData()?.access_token
            if (!accessToken) {
                try {
                    var apiClient = new LayerSwapAuthApiClient();
                    const res = await apiClient.guestConnectAsync()
                    updateAuthData(res)
                    setUserType(UserType.GuestUser)
                }
                catch (error) {
                    toast.error(error.response?.data?.error || error.message)
                    return;
                }
            }

            const swapId = await createSwap(values, query, partner);
            await router.push({
                pathname: `/swap/${swapId}`,
                query: resolvePersistantQueryParams(router.query)
            })
        }
        catch (error) {
            const data: ApiError = error?.response?.data?.error
            if (data?.code === LSAPIKnownErrorCode.BLACKLISTED_ADDRESS) {
                toast.error("You can't transfer to that address. Please double check.")
            }
            else if (data?.code === LSAPIKnownErrorCode.INVALID_ADDRESS_ERROR) {
                toast.error(`Enter a valid ${values.to?.display_name} address`)
            }
            else if (data?.code === LSAPIKnownErrorCode.UNACTIVATED_ADDRESS_ERROR && values.to) {
                setNetworkToConnect({
                    DisplayName: values.to?.display_name,
                    AppURL: data.message
                })
                setShowConnectNetworkModal(true);
            }
            else {
                toast.error(error.message)
            }
        }
    }, [createSwap, query, partner, router, updateAuthData, setUserType])

    const destAddress: string = query?.destAddress as string;

    const isPartnerAddress = partner && destAddress;

    const isPartnerWallet = isPartnerAddress && partner?.is_wallet;

    const initialValues: SwapFormValues = generateSwapInitialValues(settings, query)

    return <>
        <Modal height="fit" show={showConnectNetworkModal} setShow={setShowConnectNetworkModal} header={`${networkToConnect?.DisplayName} connect`}>
            {networkToConnect && <ConnectNetwork NetworkDisplayName={networkToConnect?.DisplayName} AppURL={networkToConnect?.AppURL} />}
        </Modal>
        <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validateOnMount={true}
            validate={MainStepValidation({ settings, query })}
            onSubmit={handleSubmit}
        >
            <SwapForm isPartnerWallet={!!isPartnerWallet} partner={partner} />
        </Formik>
    </>
}

