
import {videoViews } from "@/db/schema"
import {createTRPCRouter, protectedProcedure} from "@/trpc/init"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { and } from "drizzle-orm"
import { eq } from "drizzle-orm"
import { db } from "@/db"

export const videoViewsRouter = createTRPCRouter({
    
    
    create: protectedProcedure.input(z.object({videoId:z.string()})).mutation(async({ctx,input})=>{
        const {videoId} = input
        const user = ctx.user

        if(!user){
           throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to view this video"})
        }

        const userId = user.id

        const [existingVideoView] = await db.select().from(videoViews)
        .where(
            and(
            eq(videoViews.videoId,videoId),
            eq(videoViews.userId,userId)
        ))

        if(existingVideoView){
            return existingVideoView
        }
        
        const[createdVideoView] = await db.insert(videoViews).values({
            videoId,
            userId
        }).returning()

        return createdVideoView

    })
})
