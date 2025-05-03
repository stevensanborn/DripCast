import { VideoGetManyOutput } from "@/modules/videos/types"
import Link from "next/link";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";

interface VideoGridCardProps {
    data:VideoGetManyOutput["items"][number];
    onRemove:()=>void;
}

export const VideoGridCard = ({data,onRemove}:VideoGridCardProps)=>{
    return(
        <div className="flex flex-col gap-2 w-full group vgridcars">
            <Link prefetch  href={`/videos/${data.id}`} 
            className="">
                <VideoThumbnail
                imageURL={data.thumbnailUrl}
                previewURL={data.previewUrl}
                title={data.title}
                duration={data.duration ?? 0}
                />
            </Link>
            <VideoInfo data={data} onRemove={onRemove}/>
        </div>
    )
}

export const VideoGridCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 w-full group">
            <VideoThumbnailSkeleton />
            <VideoInfoSkeleton />
        </div>
    )
}