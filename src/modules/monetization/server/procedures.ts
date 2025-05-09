import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import { protectedProcedure } from "@/trpc/init"
import { monetization, monetizationInsertSchema,  monetizationTransactions,  monetizationUpdateSchema } from "@/db/schema"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { monetizationTransactionInsertSchema } from "@/db/schema"


export const monetizationRouter = createTRPCRouter({
    create: protectedProcedure.input(monetizationInsertSchema).mutation(async({ctx,input})=>{
        const {videoId,type,cost,duration,startTime,endTime,creatorKey,title,description} = input
        const {user} = ctx
        if(!user){
            throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to update monetization"})
        }
        const updatedMonetization = await db.insert(monetization).values({
            videoId,
            title,
            description,
            duration,
            type,
            cost,
            startTime,
            endTime,
            creatorKey,
        })
        .returning()
        
        return updatedMonetization
    }),

    update: protectedProcedure.input(monetizationUpdateSchema).mutation(async({ctx,input})=>{
        const {id,videoId,type,cost,duration,startTime,endTime,title,description} = input
        if(!id){
            throw new TRPCError({code:"BAD_REQUEST",message:"No id provided"})
        }
        const {user} = ctx
        if(!user){
            throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to update monetization"})
        }
        const [updatedMonetization] = await db.update(monetization).set({
            videoId,
            title,
            description,
            duration,
            type,
            cost,
            startTime,
            endTime,
        }).where(eq(monetization.id,id)).returning()
        if(!updatedMonetization){
            throw new TRPCError({code:"NOT_FOUND",message:"Monetization not found"})
        }
        return updatedMonetization
    }),

    remove: protectedProcedure.input(z.object({id:z.string()})).mutation(async({ctx,input})=>{
        const {id} = input
        const {user} = ctx
        if(!user){
            throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to update monetization"})
        }
        // const userId = user.id

        const [deletedMonetization] = await db.delete(monetization).where(eq(monetization.id,id)).returning()
        if(!deletedMonetization){
            throw new TRPCError({code:"NOT_FOUND",message:"Monetization not found"})
        }
        return deletedMonetization
    }),
    getOne:baseProcedure.input(z.object({id:z.string()})).query(async({input})=>{
        const {id} = input
        const [result] = await db.select().from(monetization).where(eq(monetization.id,id))
        if(!result){
            throw new TRPCError({code:"NOT_FOUND",message:"Monetization not found"})
        }
        return result
    }),
    getMany:baseProcedure.input(z.object({videoId:z.string()})).query(async({input})=>{
        const {videoId} = input
        // const {user} = ctx
        // if(!user){
        //     throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to get monetization"})
        // }
        // const userId = user.id
        const monetizations = await db.select().from(monetization).where(eq(monetization.videoId,videoId))
        return monetizations
    }),
    createTransaction:protectedProcedure.input(monetizationTransactionInsertSchema).mutation(async({ctx,input})=>{
        const {monetizationId,transactionId} = input
        const {user} = ctx
        if(!user){
            throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to create a transaction"})
        }
        const [createdTransaction] = await db.insert(monetizationTransactions).values({
            monetizationId,
            transactionId
        }).returning()
        return createdTransaction
    })
})
