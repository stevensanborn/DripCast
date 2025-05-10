"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import React, { useEffect, useMemo } from "react";
import {
  ConnectionProvider,
  useConnection,
  useWallet,
  WalletProvider,
  AnchorWallet
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { SolanaState } from "./solana-state";
import { AnchorProvider } from "@coral-xyz/anchor";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";

export default function AppWalletProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = "https://devnet.helius-rpc.com/?api-key=e6bc5c8f-3dd6-4bfb-9b3b-b198a19d7a65"
    // useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
      () => [
    //     // manually add any legacy wallet adapters here
    //     // new UnsafeBurnerWalletAdapter(),
    // new PhantomWalletAdapter(),
    // new SolflareWalletAdapter(),
      ],[]
    //   []
    //   [network],// unecessary dependency
    );
   
    // useMemo(()=>{
    //     SolanaState.connection=connection;
    // },[connection]);

  
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <SolanaStateCopier />
            {children}
        </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }


  const SolanaStateCopier = () => {
    const  wallet  = useWallet();
    const { connection } = useConnection();
    const provider = useAnchorProvider();
    useEffect(() => {
      SolanaState.wallet = wallet;
      SolanaState.connection = connection;
      SolanaState.provider = provider;
    //   console.log("SolanaState.provider", SolanaState.provider)
    //   console.log("SolanaState.connection", SolanaState.connection)
    //   console.log("SolanaState.wallet", SolanaState.wallet)
    // //   SolanaState.provider = useAnchorProvider();
    // //   console.log("SolanaState.provider", SolanaState.provider)
    }, [wallet, connection,provider]);
    return (
        <></>
    );
  };

  export function useAnchorProvider() {
    const { connection } = useConnection()
    const wallet = useWallet()
    return new AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })
  }
