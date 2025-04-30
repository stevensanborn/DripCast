import assert from 'assert';
import { context } from '../context';
import { getCreatorPDA, getDripcastPDA, getMonetizationPDA } from '../utils';
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

        //get balance of creatorPDA
        const balanceCreatorPDA = await context.connection.getBalance(creatorPDA);
        console.log("CREATORPDA BALANCE", balanceCreatorPDA);

        const balanceCreator = await context.connection.getBalance(context.ContentCreator.publicKey);
        console.log("CREATOR BALANCE", balanceCreator);
            
        //get balance of Dripcast PDA
        const [dripcastPDA, _dbump] = getDripcastPDA(context.ContentCreator.publicKey,program.programId);
        assert.ok(dripcastPDA);
        const balanceDripcastPDA = await context.connection.getBalance(dripcastPDA);
        console.log("DRIPCAST PDA BALANCE", balanceDripcastPDA);

        const amount = 500;
        //calculate fee
        let fee = amount * 0.01;
        const minFee = new BN(program.idl.constants.find(c => c.name === ('MIN_TRANSACTION_FEE' as any))?.value || '0');
        console.log("MIN FEE", minFee.toNumber());
        if(new BN(fee).lt(minFee)){
            fee = minFee.toNumber();
        }
        console.log("FEE", fee);
        //do a withdrawl
        const tx = await program.methods.withdrawlCreator(
            new BN(amount),
        )
        .accountsStrict({
            signer: context.ContentCreator.publicKey,
            creator: creatorPDA,
            systemProgram: SystemProgram.programId
        })
        .signers([context.ContentCreator])
        .rpc();
        const { blockhash, lastValidBlockHeight } = await context.connection.getLatestBlockhash();
        await context.connection.confirmTransaction({
            signature: tx,
            blockhash,
            lastValidBlockHeight
        },'confirmed');
        const balanceAfterCreatorPDA = await context.connection.getBalance(creatorPDA);
        const balanceAfterCreator = await context.connection.getBalance(context.ContentCreator.publicKey);

        console.log("CREATORPDA BALANCE AFTER", balanceAfterCreatorPDA, (balanceAfterCreatorPDA - balanceCreatorPDA).toString() );
        console.log("CREATOR BALANCE AFTER", balanceAfterCreator, (balanceAfterCreator - balanceCreator).toString() );

        assert.ok(tx);
      });
};
