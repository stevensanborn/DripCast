import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError} from "uploadthing/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { utapi } from "@/modules/server/uploadthing";

const f = createUploadthing();


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
  .input(z.object({ videoId:z.string().uuid()}))
    // Set permissions and file types for this FileRoute
  .middleware(async ({ input }) => {
      const {userId:clerkUserId} = await auth(); 
      
      if (!clerkUserId) throw new UploadThingError("Unauthorized");
      const [user] = await db.select().from(users).where(eq(users.clerkId,clerkUserId))
      
      if (!user) throw new UploadThingError("Unauthorized");


      return { user, ...input};

    })
    .onUploadComplete(async ({ metadata, file }) => {
      
      //check if the thumbnail is already uploaded
      const [existingVideo] = await db.select({thumbnailKey:videos.thumbnailKey,thumbnailUrl:videos.thumbnailUrl}).from(videos).where(and(eq(videos.id,metadata.videoId),eq(videos.userId,metadata.user.id)))
      let deleteThumb = null
      if(existingVideo.thumbnailUrl && existingVideo.thumbnailKey){
        deleteThumb = existingVideo.thumbnailKey
        }
      await db.update(videos).set({
        thumbnailUrl:file.ufsUrl,
        thumbnailKey:file.key,
      }).where(and(eq(videos.id,metadata.videoId),eq(videos.userId,metadata.user.id)))     

      if(deleteThumb){
        const ufsUrl = await utapi.deleteFiles([deleteThumb])
        console.log("deleted existing thumbnail",ufsUrl)
      }
      return {uploadedBy:metadata.user.id}
    }),
    bannerUploader: f({
      image: {
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
    })
   
      // Set permissions and file types for this FileRoute
    .middleware(async () => {
        const {userId:clerkUserId} = await auth(); 
        
        if (!clerkUserId) throw new UploadThingError("Unauthorized");
        const [existingUser] = await db.select().from(users).where(eq(users.clerkId,clerkUserId))
        
        if (!existingUser) throw new UploadThingError("Unauthorized");
      
        //delete the existing banner if it exists
        if(existingUser.bannerKey){
          const ufsUrl = await utapi.deleteFiles([existingUser.bannerKey])
          console.log("deleted existing banner",ufsUrl)
          await db.update(users).set({bannerKey:null,bannerUrl:null}).where(eq(users.id,existingUser.id))
        }

        return {userId:existingUser.id};
  
      })
      .onUploadComplete(async ({ metadata, file }) => {
       
        await db.update(users).set({
          bannerUrl:file.ufsUrl,
          bannerKey:file.key,
        }).where(eq(users.id,metadata.userId))     
  
        
        return {uploadedBy:metadata.userId}
      }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
