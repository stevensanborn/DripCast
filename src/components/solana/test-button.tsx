"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  
} from "@solana/web3.js";
import AppWalletProvider from "./provider";
import { SolanaState } from "./solana-state";
import { toast } from "sonner";

export const TestButton = () => {

    return (
        <AppWalletProvider>
        <button  className="bg-dripcast text-white px-4 py-2 rounded-md absolute bottom-0 right-0 z-50" 
        onClick={()=>{
            toast.success("Test "+SolanaState.wallet?.publicKey?.toBase58());
        }}
        >
            Test
        </button>
        </AppWalletProvider>
       
    )
}