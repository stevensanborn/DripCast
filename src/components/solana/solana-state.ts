
import {  WalletContextState } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import  DRIPCAST_IDL  from "@/anchor/target/idl/dripcast.json";
import { Dripcast } from '@/anchor/target/types/dripcast'

// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'


// Re-export the generated IDL and type
export type { Dripcast }
export { DRIPCAST_IDL }

// The programId is imported from the program IDL.
export const DRIPCAST_PROGRAM_ID = new PublicKey(DRIPCAST_IDL.address)

// This is a helper function to get the Basic Anchor program.
export function getBasicProgram(provider: AnchorProvider) {
  return new Program(DRIPCAST_IDL as Dripcast, provider)
}


interface SolanaState {
    wallet: WalletContextState | null,
    connection: Connection | null,
    provider: AnchorProvider | null
}

export const SolanaState:SolanaState = {
    // connection:null,
    wallet:null,
    connection:null,
    provider:null

}


