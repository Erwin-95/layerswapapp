import { FC, useEffect } from "react"
import { useSettingsState } from "../../../context/settings"
import { useSwapDataState } from "../../../context/swap"
import Summary from "./Summary"
import { TransactionType, WithdrawType } from "../../../lib/layerSwapApiClient"
import useWalletTransferOptions from "../../../hooks/useWalletTransferOptions"
import { useFee } from "../../../context/feeContext"

const SwapSummary: FC = () => {
    const { layers, exchanges } = useSettingsState()
    const { swap, withdrawType } = useSwapDataState()
    const {
        source_network: source_network_internal_name,
        source_exchange: source_exchange_internal_name,
        destination_exchange: destination_exchange_internal_name,
        destination_network: destination_network_internal_name,
        source_network_asset,
        destination_network_asset
    } = swap || {}

    const { canDoSweepless, isContractWallet } = useWalletTransferOptions()
    const { fee: feeData, valuesChanger, minAllowedAmount } = useFee()

    const source_layer = layers.find(n => n.internal_name === source_network_internal_name)
    const sourceAsset = source_layer?.assets?.find(currency => currency?.asset === source_network_asset)
    const destination_layer = layers?.find(l => l.internal_name === destination_network_internal_name)
    const destinationAsset = destination_layer?.assets?.find(currency => currency?.asset === destination_network_asset)
    const sourceExchange = exchanges.find(e => e.internal_name === source_exchange_internal_name)
    const destExchange = exchanges.find(e => e.internal_name === destination_exchange_internal_name)

    useEffect(() => {
        valuesChanger({
            amount: swap?.requested_amount.toString(),
            destination_address: swap?.destination_address,
            from: source_layer,
            to: destination_layer,
            fromCurrency: sourceAsset,
            toCurrency: destinationAsset,
            refuel: swap?.has_refuel,
        })
    }, [swap])

    if (!swap || !source_layer || !sourceAsset || !destinationAsset || !destination_layer) {
        return <></>
    }

    const swapInputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Input)
    const swapOutputTransaction = swap?.transactions?.find(t => t.type === TransactionType.Output)
    const swapRefuelTransaction = swap?.transactions?.find(t => t.type === TransactionType.Refuel)

    let fee: number | undefined
    let min_amount: number | undefined

    const walletTransferFee = feeData?.walletFee;
    const manualTransferFee = feeData?.manualFee;

    if (isContractWallet?.ready) {
        if (withdrawType === WithdrawType.Wallet && canDoSweepless) {
            fee = walletTransferFee;
            min_amount = minAllowedAmount;
        } else {
            fee = manualTransferFee;
            min_amount = minAllowedAmount;
        }
    }

    if (swap?.fee && swapOutputTransaction) {
        fee = swap?.fee
    }

    const requested_amount = (swapInputTransaction?.amount ??
        (Number(min_amount) > Number(swap.requested_amount) ? min_amount : swap.requested_amount)) || undefined

    const destinationNetworkNativeAsset = layers.find(n => n.internal_name === destination_layer?.internal_name)?.assets.find(a => a.is_native);
    const refuel_amount_in_usd = Number(destinationAsset?.refuel_amount_in_usd)
    const native_usd_price = Number(destinationNetworkNativeAsset?.usd_price)

    const refuelAmountInNativeCurrency = swap?.has_refuel
        ? ((swapRefuelTransaction?.amount ??
            (refuel_amount_in_usd / native_usd_price))) : undefined;

    return <Summary
        sourceCurrency={sourceAsset}
        destinationCurrency={destinationAsset}
        source={source_layer}
        sourceExchange={sourceExchange}
        destination={destination_layer}
        destExchange={destExchange}
        requestedAmount={requested_amount as number}
        destinationAddress={swap.destination_address}
        hasRefuel={swap?.has_refuel}
        refuelAmount={refuelAmountInNativeCurrency}
        exchange_account_connected={swap?.exchange_account_connected}
        exchange_account_name={swap?.exchange_account_name}
    />
}
export default SwapSummary