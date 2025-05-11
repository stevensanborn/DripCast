import { SolanaState,getBasicProgram } from "@/components/solana/solana-state";
import { monetization } from "@/db/schema";
import { getMonetizationAddress } from "./monetization";
import { getHexHash } from "@/lib/utils";
import { Transaction, VersionedTransaction } from "@solana/web3.js";


export async function purchaseMonetization( m:typeof monetization.$inferSelect){
    
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

    //get monetazaiton State PDA
    
    const connection = SolanaState.connection!;
    const monetizationAddress = await getMonetizationAddress(SolanaState.wallet.publicKey, await getHexHash(m.id));

     
    const accountInfo = await connection!.getAccountInfo(monetizationAddress);
    
    if(!accountInfo){
        throw new Error("Monetization not found for "+monetizationAddress.toBase58());
    }
    
    const program = getBasicProgram(SolanaState.provider);

    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction();

    console.log("init monetization state", m)
    const pre = await program.methods.initializeMonetizationState(m).accounts({ 
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
        console.log("initialize monetization state tx", tx)
        return tx;
    } catch (e) {
        console.log("error", e)
        throw e;
    }

}