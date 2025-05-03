import { NextRequest } from "next/server";
import { VideoAssetCreatedWebhookEvent, VideoAssetDeletedWebhookEvent, VideoAssetErroredWebhookEvent, VideoAssetReadyWebhookEvent, VideoAssetTrackReadyWebhookEvent} from "@mux/mux-node/resources/webhooks";
import { headers } from "next/headers";
import { mux } from "@/lib/mux";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET;


type VideoWebhookEvent = {
    type: string;
    data: {
        id: string;
        status: string;
    };
};

export const POST = async (req: NextRequest) => {
    if (!SIGNING_SECRET) {
        return new Response(" MUX Signing secret not found", { status: 500 });
    }
const headersPayload = await headers();
const muxSignature = headersPayload.get("mux-signature")
if(!muxSignature){
    return new Response("MUX Signature not found", {status:401})
}
const payload = await req.json();
const body = JSON.stringify(payload);

mux.webhooks.verifySignature(
    body,{
        "mux-signature" :muxSignature
    },
    SIGNING_SECRET)

    console.log(payload.type as VideoWebhookEvent["type"]);

switch(payload.type as VideoWebhookEvent["type"]){
    case "video.asset.created":{
        const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
        console.log(data);
        if(!data.upload_id){
            return new Response("Upload ID not found", {status:400})
        }
        console.log(data.upload_id);

        await db.update(videos)
        .set({
            muxAssetId:data.id,
            muxStatus:data.status
        }).where (eq(videos.muxUploadId,data.upload_id))
        break;
    }

    case "video.asset.ready":{
        
        const data = payload.data as VideoAssetReadyWebhookEvent["data"];
        const playbackId = data.playback_ids?.[0].id;
        if(!data.upload_id){
            return new Response("Upload ID not found", {status:400})
        }
        if(!playbackId){
            return new Response("Playback ID not found", {status:400})
        }
        const thumbnailURL = 'https://image.mux.com/'+playbackId+'/thumbnail.jpg';
        const previewURL = 'https://image.mux.com/'+playbackId+'/animated.gif';
        const duration = data.duration ? Math.round(data.duration *1000) : 0;
        await db.update(videos).set({
            muxPlaybackId:playbackId,
            muxStatus:data.status,
            muxAssetId:data.id,
            thumbnailUrl:thumbnailURL,
            previewUrl:previewURL,
            duration:duration
        }).where(eq(videos.muxUploadId,data.upload_id))

          
        break;
    }
    case "video.asset.errored":{
        const data = payload.data as VideoAssetErroredWebhookEvent["data"];
       
        if(!data.upload_id){
            return new Response("Upload ID not found", {status:400})
        }
        console.log("deleting video asset")

        await db.update(videos).set({
            muxStatus:data.status
        }).where(eq(videos.muxUploadId,data.upload_id))

        break;
    }

    case "video.asset.deleted":{
        const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
        
        if(!data.upload_id){
            return new Response("Upload ID not found", {status:400})
        }

        await db.delete(videos).where(eq(videos.muxUploadId,data.upload_id))
        console.log("video asset deleted")

        break;
    }
    case "video.asset.track.ready":{
        const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] &{ asset_id:string };
        

        const assetId = data.asset_id;
        if(!data.asset_id){
            return new Response("Asset ID not found", {status:400})
        }
        if(!data.id){
            return new Response("Track ID not found", {status:400})
        }
        console.log("track ready");

        const trackId = data.id;
        const status = data.status;

        await db.update(videos).set({
            muxTrackId:trackId,
            muxTrackStatus:status
        }).where(eq(videos.muxAssetId,assetId))

        break;
    }

    case "video.asset.deleted":{
        const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
        if(!data.upload_id){
            return new Response("Upload ID not found", {status:400})
        }

        await db.delete(videos).where(eq(videos.muxUploadId,data.upload_id))
        console.log("video asset deleted")

        break;
    }
}

return new Response("Webhook received: Video asset created", {status:200})
}
