
import assert from 'assert';
import { context } from '../context';
import { getMonetizationPDA } from '../utils';
import { getMonetizationStatePDA } from '../utils';
import { SystemProgram } from '@solana/web3.js';
import {  test } from "node:test";

export const closeTestSuite = () => {
   
    const program = context.program

  test("CLOSE MONETIZATION STATE", async () => {
    const [monetizationStatePDA, _bump] = getMonetizationStatePDA( context.payPerMinuteMonetization, context.ContentConsumer.publicKey, program.programId);
    assert.ok(monetizationStatePDA);

    const tx = await program.methods.closeMonetizationState()
        .accountsStrict({
            signer: context.ContentConsumer.publicKey,
            monetizationState: monetizationStatePDA,
            systemProgram: SystemProgram.programId
        })
  })

  test("CLOSE MONETIZATION", async () => {
    const [pkey, _bump] = getMonetizationPDA(context.content1_id,context.ContentCreator.publicKey,program.programId);
    let monetizationAccountInfo = await program.account.monetization.fetch(pkey);
    assert.ok(monetizationAccountInfo)

    const tx = await program.methods.closeMonetization()
        .accountsStrict({
            signer: context.ContentCreator.publicKey,
            monetization: pkey,
            systemProgram: SystemProgram.programId
        })
  })

  test("CLOSE CREATOR", async () => {
    const tx = await program.methods.closeCreator()
        .accountsStrict({
            signer: context.ContentCreator.publicKey,
            creator: context.ContentCreator.publicKey,
            systemProgram: SystemProgram.programId
        })
  })
}
