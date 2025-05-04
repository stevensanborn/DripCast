import StudioView from "@/modules/studio/ui/views/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { INFINITE_QUERY_LIMIT } from "@/constants";
import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
export const dynamic = "force-dynamic"


const StudioPage = async () => {
    void trpc.studio.getMany.prefetchInfinite({
        limit: INFINITE_QUERY_LIMIT,
    });
    
    const {userId:clerkUserId} = await auth(); 
    if(!clerkUserId) return null
    const [user] = await db.select().from(users).where(eq(users.clerkId,clerkUserId))
    

    return (
        <HydrateClient>
            {
                user ?(
                    <StudioView userId={user.id}></StudioView>
                )
                :
                <div>
                    <p>You are not authorized to access this page</p>
                </div>  
            }
        </HydrateClient>
    )
}   

export default StudioPage