import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dripcast } from "../target/types/dripcast";
import DEVWALLET from "../../wallet/DRP89vhFSNTpLYJWTU4VBYjcxQ1bEGZ9qZEd3d68oee5.json";
import { describe, test } from "node:test";
import { Connection, PublicKey, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import assert from "node:assert";

describe("dripcast", () => {
    const program = anchor.workspace.dripcast as Program<Dripcast>;
    console.log("setup provider")
      const dripSigner = anchor.web3.Keypair.fromSecretKey(new Uint8Array(DEVWALLET));
      const wallet = new anchor.Wallet(dripSigner)
      const provider = new anchor.AnchorProvider(
        new anchor.web3.Connection("https://devnet.helius-rpc.com/?api-key=e6bc5c8f-3dd6-4bfb-9b3b-b198a19d7a65", "confirmed"),
        wallet,
        {}
      );
      anchor.setProvider(provider);

  test("initialize dripcast", async () => {

    const creatorPubkey = new PublicKey("Bf94MpVtX45PWLwFSWbtKSHWGGFaXU2j7vFqe1RmhmoM")

console.log("TESTING")
    
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

//     console.log("connection", connection)
//     console.log("get latest blockhash")
    const { blockhash } = await connection.getLatestBlockhash();

//     console.log("setup pre" , program.programId)

//     const transaction = new Transaction();
//     const pre = await program.methods.initializeDripcast().accounts({ }).instruction()
//     transaction.add(pre)
//     transaction.recentBlockhash = blockhash

//     transaction.feePayer = dripSigner.publicKey
//     try{
//         const versionedTx = new VersionedTransaction(transaction.compileMessage());
//         const signedTx = await wallet.signTransaction(versionedTx)
//         const tx = await connection.sendRawTransaction(signedTx.serialize())
//         assert.ok(tx);
//         console.log("tx", tx)
//     } catch (e) {
//         console.log("error", e)
//     }
// //     console.log("pre")
    
        
    

    const [pkey, _bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator"),creatorPubkey.toBuffer()], program.programId);
        console.log("pkey", pkey.toBase58())
        const accountInfo = await connection.getAccountInfo(pkey)
        console.log("accountInfo", accountInfo)
        assert.ok(accountInfo)


        let instruction =  await program.methods.closeCreator().accountsStrict({
            signer: wallet.publicKey,
            creator: pkey,  
            systemProgram: SystemProgram.programId
        }).instruction();

        const transaction = new Transaction();
        transaction.add(instruction);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;
        const versionedTx = new VersionedTransaction(transaction.compileMessage());
        const signedTx = await wallet.signTransaction(versionedTx)
        const tx = await connection.sendRawTransaction(signedTx.serialize())
        console.log("tx", tx)
        // console.log("GOT DRIPCAST ACCOUNT", pkey.toBase58());
    })



    
})


//solana program deploy ./target/deploy/dripcast.so --program-id ./target/deploy/dripcast-keypair.json --keypair ../wallet/DRP89vhFSNTpLYJWTU4VBYjcxQ1bEGZ9qZEd3d68oee5.json --url devnet 

//solana balance $(solana-keygen pubkey ./target/deploy/dripcast-keypair.json) --url devnet

//anchor idl init $(solana-keygen pubkey target/deploy/dripcast-keypair.json) --filepath target/idl/dripcast.json  --provider.cluster devnet