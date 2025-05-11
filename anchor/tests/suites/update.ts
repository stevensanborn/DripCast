
import assert from 'assert';
import { context } from '../context';
import {  getMonetizationPDA } from '../utils';
import { getMonetizationStatePDA } from '../utils';
import { SystemProgram } from '@solana/web3.js';
import {  test } from "node:test";
import { BN } from '@coral-xyz/anchor';
export const updateTestSuite = () => {
    const program = context.program
    

  test("UPDATE MONETIZATION", async () => {
    const [pkey, _bump] = getMonetizationPDA(context.monetization1_id,context.ContentCreator.publicKey,program.programId);
    let monetizationAccountInfo = await program.account.monetization.fetch(pkey);
    assert.ok(monetizationAccountInfo)
    
    const tx = await program.methods.updateMonetization(
        new BN(20000),//amount
        new BN(999999999), //duration
        15.0, //start_time
        100.5, //end_time
        "snippet" //monetization_type
    )   
        .accountsStrict({
            signer: context.ContentCreator.publicKey,
            monetization: pkey,
            systemProgram: SystemProgram.programId
        })
        .signers([context.ContentCreator])
        .rpc();

    assert.ok(tx);

    //verify pda
    monetizationAccountInfo = await program.account.monetization.fetch(pkey);
    assert.ok(monetizationAccountInfo)
    console.log("VERIFYING AMOUNT", pkey.toBase58());
    assert.strictEqual(monetizationAccountInfo.cost.toString(), new BN(20000).toString());
    assert.strictEqual(monetizationAccountInfo.duration.toString(), new BN(999999999).toString());
    assert.strictEqual(monetizationAccountInfo.startTime.toString(), (new Number(15.0)).toString());
    assert.strictEqual(monetizationAccountInfo.endTime.toString(), (new Number(100.5)).toString());
    assert.strictEqual(monetizationAccountInfo.monetizationType, "snippet");

  })
  //TEST UPDATE MONETIZATION STATE
  test("UPDATE MONETIZATION STATE", async () => {
    // const [monetizationPDA, _bmp] = getMonetizationPDA(context.monetization1_id,context.ContentCreator.publicKey,program.programId);
    const [monetizationStatePDA, _bump] = getMonetizationStatePDA(
        context.payPerMinuteMonetization, 
        context.ContentConsumer.publicKey, 
        program.programId);
    assert.ok(monetizationStatePDA);

    const amount = new BN(1000);
    const tx = await program.methods.updateMonetizationState(amount)
        .accountsStrict({
            signer: context.ContentConsumer.publicKey,
            monetizationState: monetizationStatePDA,
            systemProgram: SystemProgram.programId
        })
        .signers([context.ContentConsumer])
        .rpc();

    assert.ok(tx);
  });

}