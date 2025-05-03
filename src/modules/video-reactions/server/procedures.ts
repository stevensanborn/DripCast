
import { videoReactions,  } from "@/db/schema"
import {createTRPCRouter, protectedProcedure} from "@/trpc/init"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { and } from "drizzle-orm"
import { eq } from "drizzle-orm"
import { db } from "@/db"

export const videoReactionsRouter = createTRPCRouter({
        
    like: protectedProcedure.input(z.object({videoId:z.string().uuid()})).mutation(async({ctx,input})=>{
        const {videoId} = input
        const user = ctx.user

        if(!user){
           throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to view this video"})
        }

        const userId = user.id

        //check if the user has already liked the video
        const [existingLikedVideoReaction] = await db.select().from(videoReactions)
        .where(
            and(
            eq(videoReactions.videoId,videoId),
            eq(videoReactions.userId,userId),
            eq(videoReactions.reaction,"like")
        ))

        if(existingLikedVideoReaction){
            //if exists then delete the like
            const [deletedVideoReaction] = await db.delete(videoReactions).
            where(and(eq(videoReactions.userId,userId),eq(videoReactions.videoId,videoId)))
            .returning()

            return deletedVideoReaction;
        }
        
        const[createdVideoReaction] = await db.insert(videoReactions).values({
            videoId,
            userId,
            reaction:"like"
        })
        .onConflictDoUpdate({
            target:[videoReactions.userId,videoReactions.videoId],
            set:{
                reaction:"like"
            }
        }   )
        .returning()

        return createdVideoReaction;

    }),
    dislike: protectedProcedure.input(z.object({videoId:z.string()})).mutation(async({ctx,input})=>{
        const {videoId} = input
        const user = ctx.user

        if(!user){
           throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to view this video"})
        }

        const userId = user.id

        //check if the user has already liked the video
        const [existingDislikedVideoReaction] = await db.select().from(videoReactions)
        .where(
            and(
            eq(videoReactions.videoId,videoId),
            eq(videoReactions.userId,userId),
            eq(videoReactions.reaction,"dislike")
        ))

        if(existingDislikedVideoReaction){
            //if exists then delete the like
            const [deletedVideoReaction] = await db.delete(videoReactions).
            where(and(eq(videoReactions.userId,userId),eq(videoReactions.videoId,videoId)))
            .returning()

            return deletedVideoReaction;
        }
        
        const[createdVideoReaction] = await db.insert(videoReactions).values({
            videoId,
            userId,
            reaction:"dislike"
        })
        .onConflictDoUpdate({
            target:[videoReactions.userId,videoReactions.videoId],
            set:{
                reaction:"dislike"
            }
        })
        .returning()

        return createdVideoReaction;

    })
})
