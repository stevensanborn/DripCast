
import { commentReactions,} from "@/db/schema"
import {createTRPCRouter, protectedProcedure} from "@/trpc/init"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { and } from "drizzle-orm"
import { eq } from "drizzle-orm"
import { db } from "@/db"

export const commentReactionsRouter = createTRPCRouter({
        
    like: protectedProcedure.input(z.object({commentId:z.string().uuid()})).mutation(async({ctx,input})=>{
        const {commentId} = input
        const user = ctx.user

        if(!user){
           throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to view this video"})
        }

        const userId = user.id

        //check if the user has already liked the video
        const [existingLikedCommentReaction] = await db.select().from(commentReactions)
        .where(
            and(
            eq(commentReactions.commentId,commentId),
            eq(commentReactions.userId,userId),
            eq(commentReactions.reaction,"like")
        ))

        if(existingLikedCommentReaction){
            //if exists then delete the like
            const [deletedCommentReaction] = await db.delete(commentReactions).
            where(and(eq(commentReactions.userId,userId),eq(commentReactions.commentId,commentId)))
            .returning()

            return deletedCommentReaction;
        }
        
        const[createdCommentReaction] = await db.insert(commentReactions).values({
            commentId,
            userId,
            reaction:"like"
        })
        .onConflictDoUpdate({
            target:[commentReactions.userId,commentReactions.commentId],
            set:{
                reaction:"like"
            }
        }   )
        .returning()

        return createdCommentReaction;

    }),
    dislike: protectedProcedure.input(z.object({commentId:z.string()})).mutation(async({ctx,input})=>{
        const {commentId} = input
        const user = ctx.user

        if(!user){
           throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in dislike"})
        }

        const userId = user.id

        //check if the user has already liked the video
        const [existingDislikedCommentReaction] = await db.select().from(commentReactions)
        .where(
            and(
            eq(commentReactions.commentId,commentId),
            eq(commentReactions.userId,userId),
            eq(commentReactions.reaction,"dislike")
        ))

        if(existingDislikedCommentReaction){
            //if exists then delete the like
            const [deletedCommentReaction] = await db.delete(commentReactions).
            where(and(eq(commentReactions.userId,userId),eq(commentReactions.commentId,commentId)))
            .returning()

            return deletedCommentReaction;
        }
        
        const[createdCommentReaction] = await db.insert(commentReactions).values({
            commentId,
            userId,
            reaction:"dislike"
        })
        .onConflictDoUpdate({
            target:[commentReactions.userId,commentReactions.commentId],
            set:{
                reaction:"dislike"
            }
        })
        .returning()

        return createdCommentReaction;

    })
})
