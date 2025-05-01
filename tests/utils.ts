// import { program } from "@coral-xyz/anchor/dist/cjs/native/system";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
// import { Dripcast } from "../target/types/dripcast";
import * as anchor from "@coral-xyz/anchor";
export const setupNewKeyPair = async (connection: Connection,amount: number = 1000000000) => {

    const user = new Keypair();

    //airdrop SOL
    if(amount > 0){
        await airdrop(connection, user.publicKey,amount);
    }

    return user;

}


export const  airdrop = async (connection: any, address: any, amount = 1000000000) => {
    await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}


export const getMonetizationPDA = 
(contentId: string, consumer: PublicKey, programId: PublicKey) => {
    const [pda, bump] = PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("monetization"),
        consumer.toBuffer(),
        anchor.utils.bytes.utf8.encode(contentId)],
        programId
      );
      return [pda, bump] as [PublicKey, number];
}


export const getMonetizationStatePDA = 
(monetization: PublicKey, consumer: PublicKey, programId: PublicKey) => {
    const [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("monetization_state"), monetization.toBuffer(), consumer.toBuffer()],
        programId
      );
      return [pda, bump] as [PublicKey, number];
}

export const getCreatorPDA = (creator: PublicKey, programId: PublicKey) => {
    const [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("creator"), creator.toBuffer()],
        programId
      );
      return [pda, bump] as [PublicKey, number];
}


export const getDripcastPDA = (programId: PublicKey) => {
    const [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("dripcast")],
        programId
      );
      return [pda, bump] as [PublicKey, number];
}