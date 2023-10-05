import { Link, ArrowLeftRight } from 'lucide-react';
import { FC, useEffect, useState } from 'react'
import SubmitButton from '../../../buttons/submitButton';
import toast from 'react-hot-toast';
import { useWalletState, useWalletUpdate } from '../../../../context/wallet';
import * as zksync from 'zksync';
import { ethers, providers, utils } from 'ethers';
import { useEthersProvider, useEthersSigner } from '../../../../lib/ethersToViem/ethers';
import { useSwapTransactionStore } from '../../../store/zustandStore';
import { PublishedSwapTransactionStatus } from '../../../../lib/layerSwapApiClient';
import { useSwapDataState } from '../../../../context/swap';
import { ConnectWalletButton } from './WalletTransfer/buttons';
import { useSettingsState } from '../../../../context/settings';
import { Network } from 'zksync/build/types';

type Props = {
    depositAddress: string,
    amount: number
}

const ZkSyncWalletWithdrawStep: FC<Props> = ({ depositAddress, amount }) => {
    const [loading, setLoading] = useState(false)
    const [transferDone, setTransferDone] = useState<boolean>()
    const { zkSyncAccount } = useWalletState()
    const { setZkSyncAccount } = useWalletUpdate()
    const { setSwapTransaction } = useSwapTransactionStore()
    const { swap } = useSwapDataState()
    const [syncWallet, setSyncWallet] = useState<zksync.Wallet | zksync.RemoteWallet>(null);
    const [depositReceipt, setDepositReceipt] = useState<any>(null);
    const [transfer, setTransfer] = useState<any>(null);
    const signer = useEthersSigner();

    const { networks } = useSettingsState()
    const { source_network: source_network_internal_name } = swap
    const source_network = networks.find(n => n.internal_name === source_network_internal_name)
    const source_currency = source_network.currencies.find(c => c.asset.toLocaleUpperCase() === swap.source_network_asset.toLocaleUpperCase())
    const defaultProvider = swap?.source_network?.split('_')?.[1]?.toLowerCase() == "mainnet" ? "mainnet" : "georli";

    useEffect(() => {
        if (depositReceipt?.success) {
            setSwapTransaction(swap?.id, PublishedSwapTransactionStatus.Completed, transfer?.txHash?.replace('sync-tx:', ''));
            setTransferDone(true)
        } else {
            setSwapTransaction(swap?.id, PublishedSwapTransactionStatus.Error, transfer?.txHash?.replace('sync-tx:', ''), depositReceipt?.failReason);
        }
    }, [depositReceipt])

    const handleConnect = async () => {
        setLoading(true)
        try {
            const syncProvider = await zksync.getDefaultProvider(defaultProvider as Network);
            const wallet = await zksync.Wallet.fromEthSigner(signer, syncProvider);
            wallet.getAccountState()
            setSyncWallet(wallet);
            setZkSyncAccount(wallet.cachedAddress);
        }
        catch (e) {
            toast(e.message)
        }
        setLoading(false)
    }

    const handleTransfer = async () => {
        setLoading(true)
        try {
            const tf = await syncWallet.syncTransfer({
                to: depositAddress,
                token: swap?.source_network_asset,
                amount: zksync.closestPackableTransactionAmount(utils.parseUnits(amount.toString(), source_currency?.decimals)),
                validUntil: zksync.utils.MAX_TIMESTAMP - swap?.sequence_number,
            });
            setTransfer(tf)
            const res = await tf.awaitReceipt();
            setDepositReceipt(res);
        }
        catch (e) {
            if (e?.message)
                toast(e.message)
        }
        setLoading(false)
    }

    if (!signer) {
        return <ConnectWalletButton />
    }

    return (
        <>
            <div className="w-full space-y-5 flex flex-col justify-between h-full text-primary-text">
                <div className='space-y-4'>
                    {/* <WarningMessage messageType='informing'>
                        <span className='flex-none'>
                            Learn how to send from
                        </span>
                        <GuideLink text={source_network?.display_name} userGuideUrl='https://docs.layerswap.io/user-docs/your-first-swap/off-ramp/send-assets-from-immutablex' />
                    </WarningMessage> */}
                    {
                        !syncWallet &&
                        <SubmitButton isDisabled={loading} isSubmitting={loading} onClick={handleConnect} icon={<Link className="h-5 w-5 ml-2" aria-hidden="true" />} >
                            Connect
                        </SubmitButton>
                    }
                    {
                        syncWallet &&
                        <SubmitButton isDisabled={loading || transferDone} isSubmitting={loading || transferDone} onClick={handleTransfer} icon={<ArrowLeftRight className="h-5 w-5 ml-2" aria-hidden="true" />} >
                            Transfer
                        </SubmitButton>
                    }
                </div>
            </div>
        </>
    )
}
export default ZkSyncWalletWithdrawStep;