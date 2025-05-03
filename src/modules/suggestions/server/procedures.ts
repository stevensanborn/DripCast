import { db } from "@/db"
import { users, videoReactions, videos, videoViews } from "@/db/schema"
import { createTRPCRouter,baseProcedure } from "@/trpc/init"
import { z } from "zod"
import { eq, or, lt, desc, and, getTableColumns, not } from "drizzle-orm"
import { TRPCError } from "@trpc/server"

export const suggestionsRouter = createTRPCRouter({
   
    getMany: baseProcedure
    .input(
        z.object({
            videoId: z.string().uuid(),
            cursor: z.object({
                id: z.string().uuid(),
                updatedAt: z.date(),
            }).nullish(),
            limit: z.number().min(1).max(100),
        })
    )
    .query(async ({input})=>{
        const {limit,cursor,videoId} = input;

        const [existingVideo] = await db.select().from(videos).where(eq(videos.id,videoId))

        if(!existingVideo){
            console.error("Video not found")
            throw new TRPCError({code: 'NOT_FOUND'})
        }


        // const {user} = ctx;
        // const userId = ctx.user?.id;
      
            const videos_data = await db
            .select({
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
                    
                    eq(videos.visibility, "public"),//public videos
                    not(eq(videos.id, existingVideo.id)), //exclude the video itself
                    existingVideo.categoryId? //load videos with the same category
                    eq(videos.categoryId, existingVideo.categoryId): undefined,
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



