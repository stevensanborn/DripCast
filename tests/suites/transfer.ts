
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

        //get balance of creatorPDA
        const balanceCreatorPDA = await context.connection.getBalance(creatorPDA);
        //get balance of dripcast
        const balanceDripcast = await context.connection.getBalance(context.dripcast);
        console.log("CREATOR PDA", creatorPDA.toBase58());
        console.log("CREATOR PDA BALANCE", balanceCreatorPDA);
        console.log("DRIPCAST", context.dripcast.toBase58());
        console.log("DRIPCAST BALANCE", balanceDripcast);

        const tx = await program.methods.transferMonetizationState(
            new BN(50000),
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
        const { blockhash, lastValidBlockHeight } = await context.connection.getLatestBlockhash();
        await context.connection.confirmTransaction({
            signature: tx,
            blockhash,
            lastValidBlockHeight
        },'confirmed');
        assert.ok(tx);

        const balanceCreatorPDAAfter = await context.connection.getBalance(creatorPDA);
        const balanceDripcastAfter = await context.connection.getBalance(context.dripcast);
        console.log("CREATOR PDA BALANCE AFTER", balanceCreatorPDAAfter);
        console.log("DRIPCAST BALANCE AFTER", balanceDripcastAfter);
        
      });
};
