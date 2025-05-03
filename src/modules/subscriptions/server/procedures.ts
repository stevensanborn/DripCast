
import { subscriptions, users } from "@/db/schema"
import {createTRPCRouter, protectedProcedure} from "@/trpc/init"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { and, getTableColumns, lt, or, desc } from "drizzle-orm"
import { eq } from "drizzle-orm"
import { db } from "@/db"

export const videoSubscriptionsRouter = createTRPCRouter({
        
    create: protectedProcedure.input(z.object({userId:z.string().uuid()})).mutation(async({ctx,input})=>{
        const {userId} = input
        
    if(!ctx.user){
        throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to subscribe to a user"})
    }
    if(userId === ctx.user?.id){
        throw new TRPCError({code:"BAD_REQUEST",message:"You cannot subscribe to yourself"})
    }

       const [createdSubscription] = await db.insert(subscriptions).values({
        viewerId:ctx.user.id,
        creatorId:userId
       }).returning()

       return createdSubscription
    }),
    remove: protectedProcedure.input(z.object({userId:z.string().uuid()})).mutation(async({ctx,input})=>{
        const {userId} = input
        
        if(!ctx.user){
            throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to unsubscribe from a user"})
        }

        const [deletedSubscription] = await db.delete(subscriptions)
        .where(and(
            eq(subscriptions.viewerId,ctx.user.id),
            eq(subscriptions.creatorId,userId)))
        .returning()

        return deletedSubscription
    }),
    getMany: protectedProcedure
    .input(
        z.object({
            cursor: z.object({
                creatorId: z.string().uuid(),
                updatedAt: z.date(),
            }).nullish(),
            limit: z.number().min(1).max(100),
        })
    )
    .query(async ({ctx,input})=>{
        const {limit,cursor} = input;
        const {user} = ctx;
        const userId = user?.id;
        
            const videos_data = await db
            .select(
            {
                ...getTableColumns(subscriptions),
                user:{
                    ...getTableColumns(users),
                    subscriberCount: db.$count(subscriptions,eq(subscriptions.creatorId,users.id)),
                },
               
            })
            .from(subscriptions)
            .innerJoin(users, eq(subscriptions.creatorId,users.id))
            .where(
                and(
                    eq(subscriptions.viewerId,userId!),
                    cursor 
                    ? or (
                        lt(subscriptions.updatedAt, cursor.updatedAt),
                        and(
                            eq(subscriptions.updatedAt, cursor.updatedAt),
                            lt(subscriptions.creatorId, cursor.creatorId)
                        )
                    )
                    : undefined
                )).orderBy(desc(subscriptions.updatedAt),desc(subscriptions.creatorId))
                //add 1 to limit to check if there is a next page
                .limit(limit+1)
                
                const hasMore = videos_data.length > limit;
                //remove the last item for the next cursor
                const items = hasMore ? videos_data.slice(0, -1) : videos_data;
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore ? {id:lastItem.creatorId, updatedAt:lastItem.updatedAt   } : null;
            return {
                items,
                nextCursor,
            };    
    }),
   
})
