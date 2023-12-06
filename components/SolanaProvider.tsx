import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode, useMemo } from "react";
import { SolanaModal } from "../lib/wallets/solana/SolanaModal";

function SolanaProvider({ children }: { children: ReactNode }) {
    const solNetwork = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        [solNetwork]
    );

    return (
        <ConnectionProvider endpoint={endpoint} >
            <WalletProvider wallets={wallets} autoConnect={true}>
                <WalletModalProvider>
                    {children}
                    <SolanaModal />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default SolanaProvider;