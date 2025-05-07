"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import React, { useEffect, useMemo } from "react";
import {
  ConnectionProvider,
  useConnection,
  useWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { SolanaState } from "./solana-state";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";

export default function AppWalletProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
      () => [
    //     // manually add any legacy wallet adapters here
    //     // new UnsafeBurnerWalletAdapter(),
      ],
      []
    // //   [network], unecessary dependency
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

   

    useEffect(() => {
      SolanaState.wallet = wallet;
      SolanaState.connection = connection;
      
    }, [wallet, connection]);
    return (
        <></>
    );
  };
