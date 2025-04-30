
import assert from 'assert';
import { context } from '../context';
import { getCreatorPDA, getMonetizationPDA } from '../utils';
import { getMonetizationStatePDA } from '../utils';
import { SystemProgram } from '@solana/web3.js';
import {  test } from "node:test";
import { BN } from '@coral-xyz/anchor';

export const transferTestSuite = () => {
    const program = context.program

    test("transfer_monetization_state", async () => {
   
        
        const [monetizationStatePDA, _bump] = getMonetizationStatePDA(
            context.payPerMinuteMonetization, 
            context.ContentConsumer.publicKey, 
            program.programId);
    
        assert.ok(monetizationStatePDA);
        
        const [creatorPDA, _cbump] = getCreatorPDA(context.ContentCreator.publicKey,program.programId);
        assert.ok(creatorPDA);
        console.log("CREATOR PDA", creatorPDA.toBase58());
        const tx = await program.methods.transferMonetizationState(
            new BN(1000),
        )
        .accountsStrict({
            signer: context.ContentConsumer.publicKey,
            creator: creatorPDA,
            dripcast: context.dripcast,
            monetizationState: monetizationStatePDA,
            systemProgram: SystemProgram.programId
        })
        .signers([context.ContentConsumer])
        .rpc();
        assert.ok(tx);
      });
};
