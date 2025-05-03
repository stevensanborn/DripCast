import { db } from "@/db"
import { videos } from "@/db/schema"
import { createTRPCRouter,protectedProcedure } from "@/trpc/init"
import {  } from "@/trpc/init"
import { z } from "zod"
import { eq, or, lt, desc, and } from "drizzle-orm"
import { TRPCError } from "@trpc/server"

export const studioRouter = createTRPCRouter({
    getOne : protectedProcedure.input(z.object({
        id: z.string().uuid(),
    })).query(async ({ctx,input})=>{
        const userId = ctx.user?.id;
        const {id} = input;
        console.log("userId",userId)
        if(!userId){
            console.error("User not found , no object")
            throw new TRPCError({code: 'UNAUTHORIZED'})
        } 

        const [video] = await db.select().from(videos).where(and(eq(videos.id,id),eq(videos.userId,userId)))
        
        if(!video){
            console.error("Video not found")
            throw new TRPCError({code: 'NOT_FOUND'})
        }

        return video;
    }),
    getMany: protectedProcedure
    .input(
        z.object({
            cursor: z.object({
                id: z.string().uuid(),
                updatedAt: z.date(),
            }).nullish(),
            limit: z.number().min(1).max(100),
        })
    )
    .query(async ({ctx,input})=>{
        const {limit,cursor} = input;
        const {user} = ctx;
        
        if(!user){
            console.error("User not found , no object")
            throw new TRPCError({code: 'UNAUTHORIZED'})
        } 
       
            const videos_data = await db.select()
            .from(videos)
            .where(
                and(
                    eq(videos.userId, user!.id),
                    cursor 
                    ? or (
                        lt(videos.updatedAt, cursor.updatedAt),
                        and(
                            eq(videos.updatedAt, cursor.updatedAt),
                            lt(videos.id, cursor.id)
                        )
                    )
                    : undefined
                )).orderBy(desc(videos.updatedAt),desc(videos.id))
                //add 1 to limit to check if there is a next page
                .limit(limit+1)
                
                const hasMore = videos_data.length > limit;
                //remove the last item for the next cursor
                const items = hasMore ? videos_data.slice(0, -1) : videos_data;
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore ? {id:lastItem.id, updatedAt:lastItem.updatedAt   } : null;
            return {
                items,
                nextCursor,
            };    
    })
        
})



