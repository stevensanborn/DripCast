import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
export const GET = async ()=>{
    const {userId} = await auth();
    if(!userId){
        return new Response("Unauthorized", {status:401});
    }   

    const [existingUser] = await db.select().from(users).where(eq(users.clerkId,userId));

    if(!existingUser){
        return redirect("/sign-in/");
    }

    return redirect(`/users/${existingUser.id}`);

}
