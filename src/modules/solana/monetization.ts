import { getBasicProgram, SolanaState } from "@/components/solana/solana-state";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { getHexHash } from "@/lib/utils";
import { getCreatorAddress } from "./creator";
import { monetization } from "@/db/schema";
import { StudioGetOneOutput } from "@/modules/studio/types";
import { BN } from "@coral-xyz/anchor";

export async function initializeMonetization(v:StudioGetOneOutput, m:typeof monetization.$inferSelect,onComplete?:(tx:string)=>void){
    
    if(!SolanaState.connection){
        throw new Error("Connection not found");
    }
    if(!SolanaState.wallet || !SolanaState.wallet.publicKey){
        throw new Error("Wallet not found");
    }
    if(!SolanaState.provider){
        throw new Error("Provider not found");
    }
    
    const key = getCreatorAddress(SolanaState.wallet.publicKey);
    
    const accountInfo = await SolanaState.connection!.getAccountInfo(key);
    
    const connection = SolanaState.connection!;
    
    const program = getBasicProgram(SolanaState.provider);

    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction();

    if(!accountInfo){
        //initialize creator
        console.log("add initialize creator instruction to the transaction")
        transaction.add(await program.methods.initializeCreator(v.userId).accounts({
            signer: SolanaState.wallet.publicKey
         }).instruction())
         
    }

    console.log("initialize monetization", m)
    const pre = await program.methods.initializeMonetization(
        await getHexHash(m.id),
        m.type,
        new BN(m.cost),
        new BN(0),
        m.startTime,
        m.endTime,
    ).accounts({ signer: SolanaState.wallet.publicKey }).instruction()
    
    transaction.add(pre)
    transaction.recentBlockhash = blockhash
    transaction.feePayer =  SolanaState.wallet.publicKey

    try{
        const versionedTx = new VersionedTransaction(transaction.compileMessage());
        const signedTx = await SolanaState.provider.wallet.signTransaction(versionedTx)
        const tx = await connection.sendRawTransaction(signedTx.serialize())
        console.log("initialize monetization tx", tx)
        onComplete?.(tx)
    } catch (e) {
        console.log("error", e)
        throw e;
    }

}

export async function getMonetizationAddress(creatorPublicKey:PublicKey, videoId:string){
    console.log("get Monetizatio Address", creatorPublicKey.toBase58(),videoId)
    const provider = SolanaState.provider;
    if(!provider){
        throw new Error("Provider not found");
    }
    const program = getBasicProgram(provider);
    // console.log("program", program)
    
    const [pkey] : [PublicKey, number] = PublicKey.findProgramAddressSync(
            [Buffer.from("monetization"), creatorPublicKey.toBuffer(), Buffer.from(videoId)], program.programId);
    console.log("pkey + ", pkey.toBase58())
    return pkey;

    
}


export async function updateMonetizationOnChain(v:StudioGetOneOutput, m:typeof monetization.$inferSelect){
    
    if(!SolanaState.connection){
        throw new Error("Connection not found");
    }
    if(!SolanaState.wallet || !SolanaState.wallet.publicKey){
        throw new Error("Wallet not found");
    }
    if(!SolanaState.provider){
        throw new Error("Provider not found");
    }
    console.log("id", m.id)
    const connection = SolanaState.connection!;
    const monetizationAddress = await getMonetizationAddress(SolanaState.wallet.publicKey, await getHexHash(m.id));
    
    const accountInfo = await connection!.getAccountInfo(monetizationAddress);
    
    if(!accountInfo){
        throw new Error("Monetization not found for "+monetizationAddress.toBase58());
    }
    
    const program = getBasicProgram(SolanaState.provider);

    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction();

    console.log("update monetization", m)
    const pre = await program.methods.updateMonetization(
        new BN(m.cost),
        new BN(m.duration?Number(m.duration):0),
        m.startTime,
        m.endTime,
        m.type,
    ).accounts({ 
        signer: SolanaState.wallet.publicKey,
        monetization: monetizationAddress
    }).instruction()
    
    transaction.add(pre)
    transaction.recentBlockhash = blockhash
    transaction.feePayer =  SolanaState.wallet.publicKey

    try{
        const versionedTx = new VersionedTransaction(transaction.compileMessage());
        const signedTx = await SolanaState.provider.wallet.signTransaction(versionedTx)
        const tx = await connection.sendRawTransaction(signedTx.serialize())
        console.log("initialize monetization tx", tx)
        return tx;
    } catch (e) {
        console.log("error", e)
        throw e;
    }

}

export async function closeMonetization(v:StudioGetOneOutput, m:typeof monetization.$inferSelect){

    if(!SolanaState.connection){
        throw new Error("Connection not found");
    }
    if(!SolanaState.wallet || !SolanaState.wallet.publicKey){
        throw new Error("Wallet not found");
    }
    if(!SolanaState.provider){
        throw new Error("Provider not found");
    }
    
    const connection = SolanaState.connection!;
    const monetizationAddress = await getMonetizationAddress(SolanaState.wallet.publicKey, await getHexHash(m.id) );
    const accountInfo = await connection!.getAccountInfo(monetizationAddress);
    
    if(!accountInfo){
        throw new Error("Monetization not found for "+monetizationAddress.toBase58());
    }
    
    const program = getBasicProgram(SolanaState.provider);

    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction();

    // console.log("close monetization", m)
    const pre = await program.methods.closeMonetization().accounts({ 
        signer: SolanaState.wallet.publicKey,
        monetization: monetizationAddress
    }).instruction()
    
    transaction.add(pre)
    transaction.recentBlockhash = blockhash
    transaction.feePayer =  SolanaState.wallet.publicKey

    try{
        const versionedTx = new VersionedTransaction(transaction.compileMessage());
        const signedTx = await SolanaState.provider.wallet.signTransaction(versionedTx)
        const tx = await connection.sendRawTransaction(signedTx.serialize())
        console.log("close monetization tx", tx)
        return tx;
    } catch (e) {
        console.log("error", e)
        throw e;
    }
}



