import { Router, useRouter } from "next/router";
import { FC, useCallback } from "react";
import { useFormWizardaUpdate, useFormWizardState } from "../../context/formWizardProvider";
import {  SwapWithdrawalStep } from "../../Models/Wizard";
import ErrorStep from "./Steps/ErrorStep";
import ExchangeDelay from "./Steps/ExchangeDelayStep";
import FailedStep from "./Steps/FailedStep";
import ProccessingStep from "./Steps/ProccessingStep";
import ProccessingWalletTransactionStep from "./Steps/ProccessingWalletTransactionStep";
import SuccessfulStep from "./Steps/SuccessfulStep";
import ConnectWalletStep from "./Steps/Wallet/ConnectWalletStep";
import WithdrawExchangeStep from "./Steps/WithdrawExhangeStep";
import WithdrawNetworkStep from "./Steps/WithdrawNetworkStep";
import Wizard from "./Wizard";
import WizardItem from "./WizardItem";

const SwapWithdrawalWizard: FC = () => {
    const router = useRouter();
    const handleGoBack = useCallback(() => {
        router.back()
    }, [router])
    const { goToStep } = useFormWizardaUpdate()
    const { error } = useFormWizardState()

    const GoBackFromError = useCallback(() => goToStep(error?.Step, "back"), [error])

    return (
        <Wizard>
            <WizardItem StepName={SwapWithdrawalStep.Withdrawal} PositionPercent={90} GoBack={handleGoBack}>
                <WithdrawExchangeStep />
            </WizardItem>
            <WizardItem StepName={SwapWithdrawalStep.OffRampWithdrawal} PositionPercent={90} GoBack={handleGoBack}>
                <WithdrawNetworkStep/>
            </WizardItem>
            <WizardItem StepName={SwapWithdrawalStep.WalletConnect} GoBack={handleGoBack} PositionPercent={90} >
                <ConnectWalletStep />
            </WizardItem>
            <WizardItem StepName={SwapWithdrawalStep.Processing} PositionPercent={95} GoBack={handleGoBack}>
                <ProccessingStep />
            </WizardItem>
            <WizardItem StepName={SwapWithdrawalStep.ProcessingWalletTransaction} PositionPercent={95} GoBack={handleGoBack}>
                <ProccessingWalletTransactionStep />
            </WizardItem>
            <WizardItem StepName={SwapWithdrawalStep.Delay} PositionPercent={95} GoBack={handleGoBack}>
                <ExchangeDelay />
            </WizardItem>
            <WizardItem StepName={SwapWithdrawalStep.Success} PositionPercent={100} GoBack={handleGoBack}>
                <SuccessfulStep />
            </WizardItem>
            <WizardItem StepName={SwapWithdrawalStep.Error} PositionPercent={100} GoBack={GoBackFromError}>
                <ErrorStep />
            </WizardItem>
            <WizardItem StepName={SwapWithdrawalStep.Failed} PositionPercent={100} GoBack={handleGoBack}>
                <FailedStep />
            </WizardItem>
        </Wizard>
    )
};

export default SwapWithdrawalWizard;