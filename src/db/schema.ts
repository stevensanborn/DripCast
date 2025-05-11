import { pgTable, uuid, text, timestamp, uniqueIndex, pgEnum, foreignKey, doublePrecision, varchar, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { primaryKey } from "drizzle-orm/pg-core";

//USER
export const users = pgTable("users",{
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    name:text("name").notNull(),
    bannerUrl:text("banner_url"),
    bannerKey:text("banner_key"),
    imageUrl:text("image_url").notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
},(t)=>[uniqueIndex("clerk_id_idx").on(t.clerkId)])

export const userRelations = relations(users,({many})=>({
    videos:many(videos),
    views:many(videoViews),
    reactions:many(videoReactions),
    subscriptions:many(subscriptions,{
        relationName:"subscriptions_viewer_id_fkey"
    }),
    subscribers:many(subscriptions,{
        relationName:"subscriptions_creator_id_fkey"
    }),
    comments:many(comments),
    commentReactions:many(commentReactions)
}))

export const videoVisibility = pgEnum("video_visibility",["public","private"])

//CATEGORY
export const categories = pgTable("categories",{
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
},
(t)=>[uniqueIndex("name_idx").on(t.name)])//adds a unique index to the name column

export const categoryRelations = relations(categories,({many})=>({
    videos:many(videos)
}))

//VIDEO
export const videos = pgTable("videos",{
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    muxStatus: text("mux_status"),
    muxAssetId: text("mux_asset_id").unique(),
    muxUploadId: text("mux_upload_id").unique(),
    muxPlaybackId: text("mux_playback_id").unique(),
    muxTrackId: text("mux_track_id").unique(),
    muxTrackStatus: text("mux_track_status"),
    thumbnailUrl: text("thumbnail_url"),
    thumbnailKey: text("thumbnail_key"),
    previewUrl: text("preview_url"),
    previewKey: text("preview_key"),
    duration: doublePrecision("duration").default(0),
    visibility: videoVisibility("visibility").default("private").notNull(),
    userId: uuid("user_id").references(()=>users.id,{onDelete:"cascade"}).notNull(),
    categoryId: uuid("category_id").references(()=>categories.id,{onDelete:"set null"}),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
})

export const videoRelations = relations(videos,({one,many})=>({
    user:one(users,{
        fields:[videos.userId],
        references:[users.id]
    }),
    category:one(categories,{
        fields:[videos.categoryId],
        references:[categories.id]
    }),
    views:many(videoViews), //many to many relationship
    reactions:many(videoReactions),
    comments:many(comments)
}))


export const videoInsertSchema = createInsertSchema(videos)
export const videoUpdateSchema = createUpdateSchema(videos)
export const videoSelectSchema = createSelectSchema(videos)


//VIDEO VIEWS
export const videoViews = pgTable("video_views",{
    videoId: uuid("video_id").references(()=>videos.id,{onDelete:"cascade"}).notNull(),
    userId: uuid("user_id").references(()=>users.id,{onDelete:"cascade"}).notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
},  (t)=>[
    primaryKey({
        name:"video_views_pk",
        columns:[t.videoId,t.userId]
    })
])

export const videoViewRelations = relations(videoViews,({one})=>({
    user:one( users,{
        fields:[videoViews.userId],
        references:[users.id]
    }),
    video:one(videos,{
        fields:[videoViews.videoId],
        references:[videos.id]
    })
}))

export const videoViewSelectSchema = createSelectSchema(videoViews)
export const videoViewInsertSchema = createInsertSchema(videoViews)
export const videoViewUpdateSchema = createUpdateSchema(videoViews)


// VIDEO REACTIONS

export const reactionType = pgEnum("reaction_type",["like","dislike"])

export const videoReactions = pgTable("video_reactions",{
    videoId: uuid("video_id").references(()=>videos.id,{onDelete:"cascade"}).notNull(),
    userId: uuid("user_id").references(()=>users.id,{onDelete:"cascade"}).notNull(),
    reaction: reactionType("reaction").notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
},  (t)=>[
    primaryKey({
        name:"video_reactions_pk",
        columns:[t.videoId,t.userId]
    })
])


export const videoReactionRelations = relations(videoReactions,({one})=>({
    user:one( users,{
        fields:[videoReactions.userId],
        references:[users.id]
    }),
    video:one(videos,{
        fields:[videoReactions.videoId],
        references:[videos.id]
    })
}))

export const videoReactionSelectSchema = createSelectSchema(videoReactions)
export const videoReactionInsertSchema = createInsertSchema(videoReactions)
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions)

//SUBSCRIPTIONS 
export  const subscriptions = pgTable("subscriptions",{
    viewerId: uuid("viewer_id").references(()=>users.id,{onDelete:"cascade"}).notNull(),
    creatorId: uuid("creator_id").references(()=>users.id,{onDelete:"cascade"}).notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
},(t)=>[
    primaryKey({
        name:"subscriptions_pk",
        columns:[t.viewerId,t.creatorId]
    })
])


export const subscriptionRelations = relations(subscriptions,({one})=>({
    viewer:one(users,{
        fields:[subscriptions.viewerId],
        references:[users.id],
        relationName:"subscriptions_viewer_id_fkey"
    }),
    creator:one(users,{
        fields:[subscriptions.creatorId],
        references:[users.id],
        relationName:"subscriptions_creator_id_fkey"
    }),
}))



//COMMENTS

export const comments = pgTable("comments",{
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    userId: uuid("user_id").references(()=>users.id,{onDelete:"cascade"}).notNull(),
    videoId: uuid("video_id").references(()=>videos.id,{onDelete:"cascade"}).notNull(),
    value: text("value").notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
},(t)=>[
    foreignKey({
        columns:[t.parentId],
        foreignColumns:[t.id],
        name:"comments_parent_id_fkey"
    }).onDelete("cascade")
])

export const commentRelations = relations(comments,({one,many})=>({
    user:one(users,{
        fields:[comments.userId],
        references:[users.id]
    }),
    video:one(videos,{
        fields:[comments.videoId],
        references:[videos.id]
    }),
    parentComment:one(comments,{
        fields:[comments.parentId],
        references:[comments.id],
        relationName:"comments_parent_id_fkey"
    }),
    
    commentReactions:many(commentReactions),
    replies:many(comments,{relationName:"comments_parent_id_fkey"})
}))

export const commentSelectSchema = createSelectSchema(comments)
export const commentInsertSchema = createInsertSchema(comments)
export const commentUpdateSchema = createUpdateSchema(comments)

//COMMENT REACTIONS
export const commentReactions = pgTable("comment_reactions",{
    userId: uuid("user_id").references(()=>users.id,{onDelete:"cascade"}).notNull(),
    commentId: uuid("comment_id").references(()=>comments.id,{onDelete:"cascade"}).notNull(),
    reaction: reactionType("reaction").notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
},(t)=>[
    primaryKey({
        name:"comment_reactions_pk",
        columns:[t.userId,t.commentId]
    })
])


export const commentReactionRelations = relations(commentReactions,({one})=>({
    user:one( users,{
        fields:[commentReactions.userId],
        references:[users.id]
    }),
    comment:one(comments,{
        fields:[commentReactions.commentId],
        references:[comments.id]
    })
    
}))

export const commentReactionSelectSchema = createSelectSchema(commentReactions)
export const commentReactionInsertSchema = createInsertSchema(commentReactions)
export const commentReactionUpdateSchema = createUpdateSchema(commentReactions)




//Monetization

export const monetizationType = pgEnum("monetization_type",["purchase","snippet","payperminute"])

export const monetization = pgTable("monetization",{
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    txId: varchar("transaction_id",{length:100}),
    videoId: uuid("video_id").references(()=>videos.id,{onDelete:"cascade"}).notNull(),
    type: monetizationType("monetization_type").notNull(),
    cost: decimal("price",{precision:10,scale:2}).notNull(),
    duration:decimal("duration"),
    startTime:decimal("start_time"),
    endTime:decimal("end_time"),
    creatorKey:varchar("creator_key",{length:44}).notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
})

export const monetizationRelations = relations(monetization,({one})=>({
    video:one(videos,{
        fields:[monetization.videoId],
        references:[videos.id]
    })
}))

export const monetizationSelectSchema = createSelectSchema(monetization)
export const monetizationInsertSchema = createInsertSchema(monetization)
export const monetizationUpdateSchema = createUpdateSchema(monetization)


export const monetizationTransactions = pgTable("monetization_transactions",{
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: varchar("transaction_id",{length:100}).notNull(),
    monetizationId: uuid("monetization_id").references(()=>monetization.id,{onDelete:"cascade"}).notNull(),
    createdAt:timestamp("created_at").notNull().defaultNow(),
    updatedAt:timestamp("updated_at").notNull().defaultNow(),
})

export const monetizationTransactionRelations = relations(monetizationTransactions,({one})=>({
    monetization:one(monetization,{
        fields:[monetizationTransactions.monetizationId],
        references:[monetization.id]
    })
}))

export const monetizationTransactionSelectSchema = createSelectSchema(monetizationTransactions)
export const monetizationTransactionInsertSchema = createInsertSchema(monetizationTransactions)
export const monetizationTransactionUpdateSchema = createUpdateSchema(monetizationTransactions)