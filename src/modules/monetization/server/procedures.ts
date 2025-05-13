import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import { protectedProcedure } from "@/trpc/init"
import { monetization, monetizationInsertSchema,  monetizationTransactions,  monetizationUpdateSchema, monetizationTransactionInsertSchema, monetizationPayments, users } from "@/db/schema"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { eq,and, getTableColumns } from "drizzle-orm"
import { db } from "@/db"


export const monetizationRouter = createTRPCRouter({
    create: protectedProcedure.input(monetizationInsertSchema).mutation(async({ctx,input})=>{
        const {videoId,type,cost,duration,startTime,endTime,creatorKey,title,description} = input
        const {user} = ctx
        if(!user){
            throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to update monetization"})
        }
        const newMonetization = await db.insert(monetization).values({
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
        
        return newMonetization
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
    }),

    createPayment:protectedProcedure.input(
        z.object({monetizationId:z.string(),transactionId:z.string(),amount:z.number()})).mutation(async({ctx,input})=>{
        const {monetizationId,transactionId,amount} = input
        const {user} = ctx
        if(!user){
            throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to create a payment"})
        }
        const [createdPayment] = await db.insert(monetizationPayments).values({
            monetizationId,
            transactionId,
            amount:amount,
            userId:user.id
        }).returning()
        return createdPayment
    }),

    getMonetizationPayments:baseProcedure.input(z.object({videoId:z.string()})).query(async({ctx,input})=>{
        const {videoId} = input
        const {clerkUserId} = ctx
        console.log("monetization payments",ctx)
        if(!clerkUserId){
            console.log("no user")
            // throw new TRPCError({code:"UNAUTHORIZED",message:"You must be logged in to get monetization status"})
            return []
        }
        
        const [existingUser] = await db.select({id:users.id}).from(users).where(eq(users.clerkId,clerkUserId))
        if(!existingUser){
            console.log("no user in db0")
            return []
        }
        else{
            console.log("user in db" ,existingUser)
        }
        const payments = await db.select(
           {
            ...getTableColumns(monetizationPayments),
           }
        ).from(monetizationPayments)
        .innerJoin(monetization, eq(monetizationPayments.monetizationId,monetization.id))
       .where(
            and(
                eq(monetizationPayments.userId,existingUser.id),
                eq(monetization.videoId,videoId)
            )
        )
       
        return payments
      
    })
})
