import { db } from "@/db"
import { subscriptions, users, videoReactions, videos, videoUpdateSchema } from "@/db/schema"
import { mux } from "@/lib/mux"
import { baseProcedure, createTRPCRouter,protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, getTableColumns,  inArray, isNotNull, lt, or } from "drizzle-orm"
import { utapi } from "@/modules/server/uploadthing"
import { z } from "zod"
import { videoViews } from "@/db/schema"


export const videosRouter = createTRPCRouter({
    getManySubscribed: protectedProcedure
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
            throw new TRPCError({code: 'INTERNAL_SERVER_ERROR',message: "User not found"})
        }
        const userId = user.id;

        const viewerSubscriptions = db.$with("viewer_subscriptions").as(
            db.select({userId:subscriptions.creatorId})
            .from(subscriptions)
            .where(eq(subscriptions.viewerId,userId))
        )

        const videos_data = await db
        .with(viewerSubscriptions)
        .select(
        {
                user:users,
                viewCount: db.$count(videoViews,eq(videoViews.videoId,videos.id)),
                likeCount: db.$count(videoReactions,
                    and(eq(videoReactions.reaction,"like"),eq(videoReactions.videoId,videos.id))),
                dislikeCount: db.$count(videoReactions,
                and(eq(videoReactions.reaction,"dislike"),eq(videoReactions.videoId,videos.id))),
                ...getTableColumns(videos),
            })
            .from(videos)
            .innerJoin(users, eq(videos.userId,users.id))
            .innerJoin(viewerSubscriptions,eq(viewerSubscriptions.userId,users.id))
            .where(
                and(
                    eq(videos.visibility,"public"),
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
    }),
    getManyTrending: baseProcedure
    .input(
        z.object({
            cursor: z.object({
                id: z.string().uuid(),
                viewCount: z.number(),
            }).nullish(),
            limit: z.number().min(1).max(100),
        })
    )
    .query(async ({input})=>{
        const {limit,cursor} = input;

        // const {user} = ctx;
        
        const viewCountSubquery  = db.$count(videoViews,eq(videoViews.videoId,videos.id))

            const videos_data = await db
            .select(
            {
                user:users,
                viewCount: viewCountSubquery,
                likeCount: db.$count(videoReactions,
                    and(eq(videoReactions.reaction,"like"),eq(videoReactions.videoId,videos.id))),
                dislikeCount: db.$count(videoReactions,
                and(eq(videoReactions.reaction,"dislike"),eq(videoReactions.videoId,videos.id))),
                ...getTableColumns(videos),
            })
            .from(videos)
            .innerJoin(users, eq(videos.userId,users.id))
            .where(
                and(
                    eq(videos.visibility,"public"),
                    cursor 
                    ? or (
                        lt(viewCountSubquery, cursor.viewCount),
                        and(
                            eq(viewCountSubquery, cursor.viewCount),
                            lt(videos.id, cursor.id)
                        )
                    )
                    : undefined
                )).orderBy(desc(viewCountSubquery),desc(videos.id))
                //add 1 to limit to check if there is a next page
                .limit(limit+1)
                
                const hasMore = videos_data.length > limit;
                //remove the last item for the next cursor
                const items = hasMore ? videos_data.slice(0, -1) : videos_data;
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore ? {id:lastItem.id, viewCount:lastItem.viewCount   } : null;
            return {
                items,
                nextCursor,
            };    
    }),
    getMany: baseProcedure
    .input(
        z.object({
            categoryId: z.string().uuid().nullish(),
            userId: z.string().uuid().nullish(),
            cursor: z.object({
                id: z.string().uuid(),
                updatedAt: z.date(),
            }).nullish(),
            limit: z.number().min(1).max(100),
        })
    )
    .query(async ({input})=>{
        const {limit,cursor,categoryId,userId} = input;
        // const {user} = ctx;
             
            const videos_data = await db
            .select(
            {
                user:users,
                viewCount: db.$count(videoViews,eq(videoViews.videoId,videos.id)),
                likeCount: db.$count(videoReactions,
                    and(eq(videoReactions.reaction,"like"),eq(videoReactions.videoId,videos.id))),
                dislikeCount: db.$count(videoReactions,
                and(eq(videoReactions.reaction,"dislike"),eq(videoReactions.videoId,videos.id))),
                ...getTableColumns(videos),
            })
            .from(videos)
            .innerJoin(users, eq(videos.userId,users.id))
            .where(
                and(
                    eq(videos.visibility,"public"),
                    userId ? eq(videos.userId, userId) : undefined,
                    categoryId ? eq(videos.categoryId, categoryId) : undefined,
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
    }),
        
    getOne: baseProcedure.input(z.object({
        id: z.string().uuid()
    })).query(async ({input,ctx}) => {

        const {clerkUserId} = ctx;
        let userId = null;
        const [user] = await db.select().from(users)
        .where(inArray(users.clerkId,clerkUserId?[clerkUserId]:[]));
        if(user){
            userId = user.id;
        }

        const viewerReactions = db.$with("viewer_reactions").as(
            db.select({
                videoId:videoReactions.videoId,
                reaction:videoReactions.reaction,
            }).from(videoReactions)
            .where(inArray(videoReactions.userId,userId?[userId]:[]))
        )
        
        const viewerSubscriptions = db.$with("viewer_subscriptions").as(
            db.select().from(subscriptions)
            .where(inArray(subscriptions.viewerId,userId?[userId]:[]))
        )

        const [existingVideo] = 
        await db
            .with(viewerReactions,viewerSubscriptions)
            .select({
            ...getTableColumns(videos),
            user:{...getTableColumns(users),
                subscriberCount:db.$count(subscriptions,eq(subscriptions.creatorId,users.id)),
                viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean)
            },
            viewCount:db.$count(videoViews,eq(videoViews.videoId,videos.id)), //slow?
            likeCount:db.$count(videoReactions,and(
                eq(videoReactions.videoId , videos.id),
                eq(videoReactions.reaction , "like")
            )),
            dislikeCount:db.$count(videoReactions,and(
                eq(videoReactions.videoId , videos.id),
                eq(videoReactions.reaction , "dislike")
            )),
            viewerReaction:viewerReactions.reaction
        })
        .from(videos)

        .innerJoin(users,eq(videos.userId,users.id))
        .leftJoin(viewerReactions,eq(viewerReactions.videoId,videos.id))
        .leftJoin(viewerSubscriptions,eq(viewerSubscriptions.creatorId,videos.userId))
        .where(eq(videos.id, input.id))
        
        if(!existingVideo){
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Video not found"
            });
        }

        return existingVideo;
    }),

    //REVALIDATE VIDEO
    revalidate:protectedProcedure.input(z.object({id:z.string().uuid()}))
    .mutation(async ({ctx,input})=>{
        const {user} = ctx;
        if(!user){
            throw new TRPCError({code: 'INTERNAL_SERVER_ERROR',message: "User not found"})
        }
        const [existingVideo] = await db.select().from(videos).where(and(eq(videos.id,input.id),eq(videos.userId,user.id)))
        if(!existingVideo){
            throw new TRPCError({code: 'NOT_FOUND',message: "Video not found"})
        }
        if(!existingVideo.muxUploadId){
            throw new TRPCError({code: 'BAD_REQUEST',message: "Video not uploaded to mux"})
        }
       
        const upload = await mux.video.uploads.retrieve(existingVideo.muxUploadId)
        if(!upload || !upload.asset_id){
            throw new TRPCError({code: 'BAD_REQUEST',message: "Video existing upload not found"})
        }
        
        const asset = await mux.video.assets.retrieve(upload.asset_id)
        if(!asset){
            throw new TRPCError({code: 'BAD_REQUEST',message: "Video asset not found"})
        }
       

        const [updatedVideo] = await db.update(videos).set({
            muxStatus:asset.status,
            muxPlaybackId:asset.playback_ids?.[0].id,
            muxAssetId:asset.id,
            duration:asset.duration
        })
            .where(and(eq(videos.id,input.id),eq(videos.userId,user.id)))
            .returning()
            

        return updatedVideo;

    }),

    //RESTORE THUMBNAIL
    restoreThumbnail: protectedProcedure.input(z.object({id:z.string().uuid()}))
    .mutation(async ({ctx,input})=>{
        const {user} = ctx;
        if(!user){
            throw new TRPCError({code: 'INTERNAL_SERVER_ERROR',message: "User not found"})
        }
        let deleteThumb = null
        const [existingVideo] = await db.select().from(videos).where(and(eq(videos.id,input.id),eq(videos.userId,user.id)))
        if(existingVideo.thumbnailUrl && existingVideo.thumbnailKey){
            deleteThumb = existingVideo.thumbnailKey
        }
        if(!existingVideo){
            throw new TRPCError({code: 'NOT_FOUND',message: "Video not found"})
        }
        if(!existingVideo.muxPlaybackId){
            throw new TRPCError({code: 'BAD_REQUEST',message: "Video Thumbnail not found"})
        }
        const thumbnailURL = 'https://image.mux.com/'+existingVideo.muxPlaybackId+'/thumbnail.jpg';
        
        const [video] = await db.update(videos).set({
            thumbnailUrl:thumbnailURL,
            thumbnailKey:null
        }).where(and(eq(videos.id,input.id),eq(videos.userId,user.id))).returning();
        if(deleteThumb){
            const ufsUrl = await utapi.deleteFiles([deleteThumb])
            console.log("deleted existing thumbnail",ufsUrl)
        }
        return video;
    }),
    removeVideo: protectedProcedure.input(z.object({id:z.string().uuid()}))
    .mutation(async ({ctx,input})=>{
        const {user} = ctx;
        if(!user){
            throw new TRPCError({code: 'INTERNAL_SERVER_ERROR',message: "User not found"})
        }
        const [removedVideo] = await db.delete(videos).where(and(eq(videos.id,input.id),eq(videos.userId,user.id))).returning();
        if(!removedVideo){
         throw new TRPCError({code: 'NOT_FOUND',message: "Video not found"})
        }
        return removedVideo;
    }),
    update: protectedProcedure.input(videoUpdateSchema)
    .mutation(async ({ctx,input})=>{
        const {user} = ctx;
        if(!user){
            throw new TRPCError({code: 'INTERNAL_SERVER_ERROR',message: "User not found"})
        }
        if(!input.id){
            throw new TRPCError({code: 'BAD_REQUEST',message: "No video id provided"})
        }
        const [updatedVideo] = await db.update(videos)
        .set({
            title:input.title,
            description:input.description,
            categoryId:input.categoryId,
            visibility:input.visibility,
            updatedAt:new Date(),
        })
        .where(and(eq(videos.id,input.id),eq(videos.userId,user.id)))
        .returning();
        if(!updatedVideo){
            throw new TRPCError({code: 'NOT_FOUND',message: "Video not found"})
        }
        return updatedVideo;
    }),

    //CREATE VIDEO
    create: protectedProcedure.mutation(async ({ctx})=>{
        const {user} = ctx;
        if(!user){
            throw new TRPCError({code: 'INTERNAL_SERVER_ERROR',message: "User not found"})
        }
        const id = user.id;


        const upload = await mux.video.uploads.create({
            
            new_asset_settings: {
                passthrough:id,
                playback_policy: ["public"],
                input:[
                    {
                    generated_subtitles:[
                        {
                            language_code:"en",
                            name:"English"
                        }
                    ]
                }
                ]
                // mp4_support: "standard",

            },
            cors_origin: "*", //TODO in production, set to the actual origin
        });

        
       const [video] = await db.insert(videos).values({
        userId: id,
        title: "Untitled",
        muxStatus: "waiting",
        muxUploadId: upload.id,
       }).returning();

       return {video,url:upload.url};
    })
})