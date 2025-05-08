import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dripcast } from "../target/types/dripcast";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import DEVWALLET from "../../wallet/DRP89vhFSNTpLYJWTU4VBYjcxQ1bEGZ9qZEd3d68oee5.json";
import { before, describe, test } from "node:test";
import assert from "node:assert";
import { setupNewKeyPair, airdrop } from "./utils";
import { context } from "./context";
import { closeTestSuite } from "./suites/close";
import { updateTestSuite } from "./suites/update";
import { initializeTestSuite } from "./suites/initalize";
import { transferTestSuite } from "./suites/transfer";
import { withdrawlCreatorTestSuite } from "./suites/withdrawl";
describe("dripcast", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  
  const program = anchor.workspace.dripcast as Program<Dripcast>;
  context.program = program;

  const dripSigner = anchor.web3.Keypair.fromSecretKey(new Uint8Array(DEVWALLET));

  // let ContentCreator: Keypair;
  // let ContentConsumer: Keypair;
  context.content1_id = "uuid_testid";
  // let payPerMinuteMonetization: PublicKey;

  before(async function() {
    //setup client and user
    console.log("Setting up users");
    let ContentCreator = await setupNewKeyPair(provider.connection);
    console.log("ContentCreator Created : ",ContentCreator.publicKey.toBase58());
    let ContentConsumer = await setupNewKeyPair(provider.connection);
    console.log("ContentConsumer Created : ",ContentConsumer.publicKey.toBase58());
    console.log("Setting up users complete");

    //get balance of the users
    const balance = await provider.connection.getBalance(ContentCreator.publicKey);
    console.log("Balance of ContentCreator : ",balance/LAMPORTS_PER_SOL);
    const balanceConsumer = await provider.connection.getBalance(ContentConsumer.publicKey);
    console.log("Balance of ContentConsumer : ",balanceConsumer/LAMPORTS_PER_SOL);

    context.ContentCreator = ContentCreator;
    context.ContentConsumer = ContentConsumer;
    context.content1_id = context.content1_id;
    context.connection = provider.connection;

  });

  //INITIALIZE DRIPCAST
  test("DRIPCAST PROGRAM INITIALIZATION", async () => {

    //add some funds to the dripSigner
    await airdrop(provider.connection,dripSigner.publicKey,1);
    
    // Add your test here.
    const tx = await program.methods.initializeDripcast().accounts({
    }).signers([dripSigner]).rpc();

    console.log("Your transaction signature", tx);

    assert.ok(tx);
    
    const [pkey, _bump] = PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("dripcast")], program.programId);
      let dripcastAccountInfo = await program.account.dripcast.fetch(pkey);
      assert.ok(dripcastAccountInfo)
      console.log("GOT DRIPCAST ACCOUNT", pkey.toBase58());
      assert.strictEqual(dripcastAccountInfo.owner.toBase58(),dripSigner.publicKey.toBase58());
      console.log("VERIFIED OWNER");
      context.dripcast = pkey;
      
  });

  describe("Initialization ", initializeTestSuite);

  describe("Updating Account States ", updateTestSuite);

  describe("Transfer ", transferTestSuite);

  describe("Withdrawl ", withdrawlCreatorTestSuite);

describe("Closing Account States ", closeTestSuite.bind(this,[dripSigner]));

});