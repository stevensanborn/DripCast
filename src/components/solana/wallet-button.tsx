"use client"
import dynamic from 'next/dynamic';
import { ButtonProps } from "../ui/button";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import  {BaseWalletConnectionButton} from "@solana/wallet-adapter-react-ui/src/BaseWalletConnectionButton.tsx"

export const WalletButton = () => {
    return (
        
            <DripCastMultiButton labels={LABELS} />
        
    )
}

import "./styles.css"

const LABELS = {
    'change-wallet': 'Change wallet',
    connecting: 'Connecting ...',
    'copy-address': 'Copy address',
    copied: 'Copied',
    disconnect: 'Disconnect',
    'has-wallet': 'Connect',
    'no-wallet': 'Select Wallet',
} as const;

const DripCastMultiButton = dynamic(() => import("@solana/wallet-adapter-react-ui").then(mod => mod.BaseWalletMultiButton), { ssr: false });

// export function DripCastMultiButton(props: ButtonProps) {

//     return <BaseWalletMultiButton {...props} labels={LABELS} />;
// }

