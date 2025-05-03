
import {  commentReactions, comments, users } from "@/db/schema"
import {baseProcedure, createTRPCRouter, protectedProcedure} from "@/trpc/init"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { eq, desc, and,  or, lt, count, inArray, isNull, isNotNull } from "drizzle-orm"
import { db } from "@/db"
import { getTableColumns } from "drizzle-orm"

export const commentsRouter = createTRPCRouter({
    remove : protectedProcedure
    .input(z.object({
        id:z.string().uuid()
    })).mutation(async({ctx,input})=>{
        const {id} = input
        const {user} = ctx
        
        if(!user){
            throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to view this video"})
        }

        const userId = user.id
        
        const [deletedComment] = await db.delete(comments).where(and(
            eq(comments.id,id),
            eq(comments.userId,userId)
        )).returning()

        if(!deletedComment){
            throw new TRPCError({code:"NOT_FOUND",message:"Comment not found"})
        }

        return deletedComment
    }),
    create: protectedProcedure.input(z.object({
        videoId:z.string().uuid(),
        value:z.string(),
        parentId:z.string().uuid().nullish()
    }))
    .mutation(async({ctx,input})=>{
        const {parentId,videoId,value} = input
    
        const user = ctx.user

        if(!user){
           throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to view this video"})
        }
        const userId = user.id
        
        const [existingComment] = await db.select().from(comments).where(inArray(comments.id,parentId?[parentId]:[]))

        if(!existingComment && parentId){
            throw new TRPCError({code:"BAD_REQUEST",message:"You cannot reply to yourself"})
        }
        if(parentId && existingComment?.parentId){
            throw new TRPCError({code:"BAD_REQUEST",message:"You cannot reply to a reply"})
        }
       
        
        const[createdComment] = await db.insert(comments).values({
            videoId,
            userId,
            value,
            parentId
        }).returning()

        return createdComment

    }),
    getMany: baseProcedure
    .input(z.object({
        videoId:z.string().uuid(),
        parentId:z.string().uuid().nullish(),
        cursor:z.object({
            id:z.string().uuid(),
            updatedAt:z.date()
        }).nullish(),
        limit:z.number().min(1).max(100)
    }))
    .query(async({ctx,input})=>{
        const {clerkUserId} = ctx
        const {videoId,cursor,limit,parentId} = input
        
        let userId;
        const [userObj] = await db.select().from(users).where(inArray(users.clerkId,clerkUserId?[clerkUserId]:[]))

        if(userObj){
            userId = userObj.id
        }

        const viewerReactions = db.$with("viewer_reactions").as(
            db.select({
                commentId:commentReactions.commentId,
                reaction:commentReactions.reaction
            }).from(commentReactions)
            .where(inArray(commentReactions.userId,userId?[userId]:[]))
        )

        const replies = db.$with("replies").as(
            db.select({
                parentId:comments.parentId,
                count:count(comments.id).as("count")      
            }).from(comments)
            .where(isNotNull(comments.parentId))
            .groupBy(comments.parentId)
        )

        const [totalData,data] = await Promise.all([
            await db
            
            .select()
            .from(comments)
            .where(eq(comments.videoId,videoId)),


            await db
            .with(viewerReactions,replies)
            .select({
                ...getTableColumns(comments),
                user:users,
                viewerReaction:viewerReactions.reaction,
                replyCount:replies.count,   
                likeCount:db.$count(commentReactions,
                    and(eq(commentReactions.reaction,"like"),eq(commentReactions.commentId,comments.id))),
                dislikeCount:db.$count(commentReactions,
                    and(eq(commentReactions.reaction,"dislike"),eq(commentReactions.commentId,comments.id))), 
             })
            .from(comments)
            .where(and (
                eq(comments.videoId,videoId),
                parentId ? eq( comments.parentId, parentId):  //loading reply comments
                isNull(comments.parentId),//loading main comments not reply
                cursor ? or(
                    lt(comments.updatedAt,cursor.updatedAt),
                    and (
                        eq(comments.updatedAt,cursor.updatedAt),
                        lt(comments.id,cursor.id)
                    )
                ) : undefined
            ))
            .innerJoin(users,eq(comments.userId,users.id))
            .leftJoin(viewerReactions,eq(viewerReactions.commentId,comments.id))
            .leftJoin(replies,eq(replies.parentId,comments.id))
            .orderBy(desc(comments.updatedAt),desc(comments.id))
            .limit(limit+1)
        ])
        // const totalData =
        const totalCount = totalData.length

        // const results = 

        const hasMore = data.length > limit
        const items = hasMore ? data.slice(0,limit) : data
        const lastItem = items[items.length-1]
        const nextCursor = hasMore ? {
            id:lastItem.id,
            updatedAt:lastItem.updatedAt
        } : null

      
        return {
            items,
            hasMore,
            nextCursor,
            totalCount
        }
    })
})
