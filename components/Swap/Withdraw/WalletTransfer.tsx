import { FC } from "react"
import useSWR from "swr"
import { ApiResponse } from "../../../Models/ApiResponse"
import { useSettingsState } from "../../../context/settings"
import { useSwapDataState } from "../../../context/swap"
import NetworkSettings from "../../../lib/NetworkSettings"
import KnownInternalNames from "../../../lib/knownIds"
import LayerSwapApiClient, { DepositAddress, DepositAddressSource } from "../../../lib/layerSwapApiClient"
import TransferFromWallet from "./Wallet/ERC20Transfer"
import ImtblxWalletWithdrawStep from "./Wallet/ImtblxWalletWithdrawStep"
import StarknetWalletWithdrawStep from "./Wallet/StarknetWalletWithdraw"

const WalletTransfer: FC = () => {
    const { swap } = useSwapDataState()
    const { layers } = useSettingsState()
    const { source_network: source_network_internal_name, destination_network_asset } = swap
    const source_network = layers.find(n => n.internal_name === source_network_internal_name)
    const sourceCurrency = source_network.assets.find(c => c.asset.toLowerCase() === swap.source_network_asset.toLowerCase())

    const layerswapApiClient = new LayerSwapApiClient()
    const { data: generatedDeposit } = useSWR<ApiResponse<DepositAddress>>(`/deposit_addresses/${source_network_internal_name}?source=${DepositAddressSource.UserGenerated}`, layerswapApiClient.fetcher)
    const { data: managedDeposit } = useSWR<ApiResponse<DepositAddress>>(`/deposit_addresses/${source_network_internal_name}?source=${DepositAddressSource.Managed}`, layerswapApiClient.fetcher)
    const generatedDepositAddress = generatedDeposit?.data?.address
    const managedDepositAddress = managedDeposit?.data?.address

    const sourceNetworkSettings = NetworkSettings.KnownSettings[source_network_internal_name]
    const sourceChainId = sourceNetworkSettings?.ChainId


    const sourceIsImmutableX = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.ImmutableXMainnet?.toUpperCase() || swap?.source_network === KnownInternalNames.Networks.ImmutableXGoerli?.toUpperCase()
    const sourceIsStarknet = swap?.source_network?.toUpperCase() === KnownInternalNames.Networks.StarkNetMainnet?.toUpperCase() || swap?.source_network === KnownInternalNames.Networks.StarkNetGoerli?.toUpperCase()

    if (sourceIsImmutableX)
        return <ImtblxWalletWithdrawStep/>
    else if (sourceIsStarknet)
        return <StarknetWalletWithdrawStep />
    else
        return <div className='border-secondary-500 rounded-md border bg-secondary-700 p-3'>
            <TransferFromWallet
                swapId={swap.id}
                networkDisplayName={source_network?.display_name}
                tokenDecimals={sourceCurrency?.decimals}
                tokenContractAddress={sourceCurrency?.contract_address as `0x${string}`}
                chainId={sourceChainId as number}
                generatedDepositAddress={generatedDepositAddress as `0x${string}`}
                managedDepositAddress={managedDepositAddress as `0x${string}`}
                userDestinationAddress={swap.destination_address as `0x${string}`}
                amount={swap.requested_amount} />
        </div>

}
export default WalletTransfer
