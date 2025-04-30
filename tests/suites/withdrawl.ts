
import assert from 'assert';
import { context } from '../context';
import { getCreatorPDA, getMonetizationPDA } from '../utils';
import { getMonetizationStatePDA } from '../utils';
import { SystemProgram } from '@solana/web3.js';
import {  test } from "node:test";
import { BN } from '@coral-xyz/anchor';

export const withdrawlCreatorTestSuite = () => {
    const program = context.program

    test("withdrawl_creator", async () => {
        
        const [monetizationStatePDA, _bump] = getMonetizationStatePDA(
            context.payPerMinuteMonetization, 
            context.ContentConsumer.publicKey, 
            program.programId);
    
        assert.ok(monetizationStatePDA);
        
        const [creatorPDA, _cbump] = getCreatorPDA(context.ContentCreator.publicKey,program.programId);
        assert.ok(creatorPDA);
        console.log("CREATOR PDA", creatorPDA.toBase58());
        const tx = await program.methods.withdrawlCreator(
            new BN(1000),
        )
        .accountsStrict({
            signer: context.ContentCreator.publicKey,
            creator: creatorPDA,
            systemProgram: SystemProgram.programId
        })
        .signers([context.ContentCreator])
        .rpc();
        assert.ok(tx);
      });
};
