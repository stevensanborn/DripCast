
import assert from 'assert';
import { context } from '../context';
import { getMonetizationPDA } from '../utils';
import { getMonetizationStatePDA } from '../utils';
import {  test } from "node:test";
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";

export const initializeTestSuite = () => {

    const program = context.program

    
 

  //INITIALIZE CREATOR
  test("CREATOR INITIALIZATION", async () => {

    assert.ok(context.ContentCreator);
    
    //intialize creator account
    const user_id = "testid";
    const tx = await program.methods.initializeCreator(user_id).accounts({
      signer: context.ContentCreator.publicKey,
    }).signers([context.ContentCreator]).rpc();

    console.log("Creator initialization tx sig", tx);

    assert.ok(tx);

    //verify pda
    const [pkey, _bump] = PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("creator"), context.ContentCreator.publicKey.toBuffer()], program.programId);
      let creatorAccountInfo = await program.account.creator.fetch(pkey);
      assert.ok(creatorAccountInfo)
      assert.strictEqual(creatorAccountInfo.userId, user_id);
      assert.strictEqual(creatorAccountInfo.owner.toBase58(), context.ContentCreator.publicKey.toBase58());
      console.log("GOT CREATOR ACCOUNT", pkey.toBase58());
  });

   //INITIALIZE MONETIZATION
  test("MONETIZATION IS INITIALIZED!", async () => {

    //intialize monetization account
    const monetization_type = "PAY_PER_MINUTE";
    const cost = new BN(1000); //1 SOL
    const duration = new BN(24*60*60); //24 hours  
    const start_time = 10.5;  //10.5 seconds free
    const end_time = 600.0;  // no end time

    const tx = await program.methods.initializeMonetization(
      context.monetization1_id, 
      monetization_type, 
      cost, 
      duration, 
      start_time,
      end_time)
    .accounts({
      signer: context.ContentCreator.publicKey,
    })
    .signers([context.ContentCreator])
    .rpc();

    console.log("Your transaction signature", tx);
    assert.ok(tx);

    //verify pda 
    console.log("Verifying monetization pda");

    const [pkey, _bump] = getMonetizationPDA(context.monetization1_id,context.ContentCreator.publicKey,program.programId);
      let monetizationAccountInfo = await program.account.monetization.fetch(pkey);
      assert.ok(monetizationAccountInfo)
      console.log("GOT MONETIZATION ACCOUNT", pkey.toBase58());
      context.payPerMinuteMonetization = pkey;
      assert.strictEqual(monetizationAccountInfo.monetizationId, context.monetization1_id);
      assert.strictEqual(monetizationAccountInfo.monetizationType, monetization_type);
      assert.strictEqual(monetizationAccountInfo.cost.toString(), cost.toString());
      assert.strictEqual(monetizationAccountInfo.duration.toString(), duration.toString());
      assert.strictEqual(monetizationAccountInfo.startTime.toString(), start_time.toString());
      assert.strictEqual(monetizationAccountInfo.endTime.toString(), end_time.toString());
      
  });


  //TEST INITIALIZE MONETIZATION STATE
  test("INITIALIZE MONETIZATION STATE", async () => {

    //save monetization state
    const tx = await program.methods.initializeMonetizationState(context.payPerMinuteMonetization,"teststateid",new BN(1000)).accounts({
      signer: context.ContentConsumer.publicKey,
    }).signers([context.ContentConsumer]).rpc();

    assert.ok(tx);

    //verify pda
    const [monetizationStatePDA, _bump] = getMonetizationStatePDA(context.payPerMinuteMonetization,context.ContentConsumer.publicKey,program.programId);
    assert.ok(monetizationStatePDA);
    let monetizationStateAccountInfo = await program.account.monetizationState.fetch(monetizationStatePDA);
    assert.ok(monetizationStateAccountInfo)
    console.log("GOT MONETIZATION STATE ACCOUNT", monetizationStatePDA.toBase58());

    
  });

}