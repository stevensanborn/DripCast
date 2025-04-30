// tests/utils/context.ts
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Dripcast } from "../target/types/dripcast";

export interface TestContext {
    ContentCreator?: Keypair;
    ContentConsumer?: Keypair;
    payPerMinuteMonetization?: PublicKey;
    program?: Program<Dripcast>;
    content1_id?: string;
    dripcast?: PublicKey;
}

export const context: TestContext = {};