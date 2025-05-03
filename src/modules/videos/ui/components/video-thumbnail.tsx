import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import { THUMBNAIL_FALLBACK_URL } from "../../constants";
import { Skeleton } from "@/components/ui/skeleton";
interface VideoThumbnailProps{
    imageURL?:string | null;
    previewURL?:string | null;
    title:string;
    duration:number;
}

export const VideoThumbnail = ({imageURL,previewURL,title,duration}:VideoThumbnailProps) => {
    return (
        <div className="relative group">

         {/* {thumbnail wrapper } */}

         <div className="relative w-full overflow-hidden rounded-xl aspect-video">
           <Image src={imageURL || THUMBNAIL_FALLBACK_URL} alt={title} fill className="w-full h-full object-cover hover:opacity-0" />
           <Image src={previewURL || THUMBNAIL_FALLBACK_URL} alt={title} fill className="w-full h-full object-cover opacity-0 group-hover:opacity-100" unoptimized={!!previewURL} />
         </div>

        <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded  bg-black text-white font-medium">
            { formatDuration(duration)}
        </div>
        </div>

    )
}

export const VideoThumbnailSkeleton = () => {
    return (
        <div className="relative w-full overflow-hidden rounded-xl aspect-video ">
            <Skeleton className="size-full" />
        </div>
    )
}