import { db } from "@/db"
import { videoReactions, videos, videoViews } from "@/db/schema"
import { createTRPCRouter,baseProcedure } from "@/trpc/init"
import { z } from "zod"
import { eq, or, lt, desc, and, ilike, getTableColumns } from "drizzle-orm"
import { users } from "@/db/schema"

export const searchRouter = createTRPCRouter({
  
    getMany: baseProcedure
    .input(
        z.object({
            query: z.string(),
            categoryId: z.string().uuid().nullish(),
            cursor: z.object({
                id: z.string().uuid(),
                updatedAt: z.date(),
            }).nullish(),
            limit: z.number().min(1).max(100),
        })
    )
    .query(async ({input})=>{
        const {limit,cursor,query,categoryId} = input;
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
                    ilike(videos.title, `%${query}%`),
                    eq(videos.visibility,"public"),
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
    })
        
})



