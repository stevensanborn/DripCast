import { getBasicProgram, SolanaState } from "@/components/solana/solana-state";
import { useAnchorProvider } from "@/components/solana/provider";
import {users } from "@/db/schema"
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { getHexHash } from "@/lib/utils";
import { AnchorProvider } from "@coral-xyz/anchor";

export async function initializeCreator(creatorId:string) {

    if(!SolanaState.connection){
        throw new Error("Connection not found");
    }
    if(!SolanaState.wallet || !SolanaState.wallet.publicKey){
        throw new Error("Wallet not found");
    }
    
    const connection = SolanaState.connection!;
    const provider = SolanaState.provider;
    if(!provider){
        throw new Error("Provider not found");
    }
    const program = getBasicProgram(provider);
    
     //check if creator has already been initialized
    const accountInfo = await getCreatorAccountInfo(SolanaState.wallet.publicKey)

    console.log("accountInfo", accountInfo)
    if(accountInfo){
        console.log("Creator has already been initialized")
        
    }else{
        console.log("Creator has not found , initializing..." )

        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction();
        const pre = await program.methods.initializeCreator(creatorId).accounts({
            signer: SolanaState.wallet.publicKey
         }).instruction()
        transaction.add(pre)
        transaction.recentBlockhash = blockhash
        transaction.feePayer =  provider.wallet.publicKey

        try{
            const versionedTx = new VersionedTransaction(transaction.compileMessage());
                const signedTx = await provider.wallet.signTransaction(versionedTx)
                const tx = await connection.sendRawTransaction(signedTx.serialize())
                console.log("initialize creator tx", tx)
        } catch (e) {
            console.log("error", e)
            throw e;
        }

    }
}

//get pda for creator
export function getCreatorAddress(creatorPublicKey:PublicKey){
    console.log("getCreatorAddress", creatorPublicKey.toBase58())
    const provider = SolanaState.provider;
    if(!provider){
        throw new Error("Provider not found");
    }
    const program = getBasicProgram(provider);
    // console.log("program", program)
    
    const [pkey, _bump] : [PublicKey, number] = PublicKey.findProgramAddressSync(
            [Buffer.from("creator"),creatorPublicKey.toBuffer()], program.programId);
    console.log("pkey + ", pkey.toBase58())
    return pkey;
}

//get account info for creator
export async function getCreatorAccountInfo(creatorPublicKey:PublicKey){
    
    const pkey = getCreatorAddress(creatorPublicKey);
    const accountInfo = await SolanaState.connection!.getAccountInfo(pkey);
    return accountInfo;
}


export async function closeCreator(creatorPublicKey:PublicKey){


    if(!SolanaState.connection){
        throw new Error("Connection not found");
    }
    if(!SolanaState.wallet || !SolanaState.wallet.publicKey){
        throw new Error("Wallet not found");
    }
    
    const connection = SolanaState.connection!;
    const provider = SolanaState.provider;
    if(!provider){
        throw new Error("Provider not found");
    }
    const program = getBasicProgram(provider);
    
     //check if creator has already been initialized
    const accountInfo = await getCreatorAccountInfo(SolanaState.wallet.publicKey)

    console.log("accountInfo", accountInfo)


    if(accountInfo){
        console.log("Creator has  been initialized , removing ...")
   
        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction();
        const pre = await program.methods.closeCreator().accounts({
            signer: SolanaState.wallet.publicKey
         }).instruction()
        transaction.add(pre)
        transaction.recentBlockhash = blockhash
        transaction.feePayer =  provider.wallet.publicKey

        try{
            const versionedTx = new VersionedTransaction(transaction.compileMessage());
                const signedTx = await provider.wallet.signTransaction(versionedTx)
                const tx = await connection.sendRawTransaction(signedTx.serialize())
                console.log("initialize creator tx", tx)
        } catch (e) {
            console.log("error", e)
            throw e;
        }

    }else{
        console.log("Creator has not been initialized for "+SolanaState.wallet.publicKey.toBase58())
    }

}