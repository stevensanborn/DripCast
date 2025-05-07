
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

// import { Connection } from "@solana/web3.js";

interface SolanaState {
    wallet:WalletContextState|null,
    connection:Connection|null,
   
}

export const SolanaState:SolanaState = {
    // connection:null,
    wallet:null,
    connection:null,

}