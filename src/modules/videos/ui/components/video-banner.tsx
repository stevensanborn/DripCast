
import {VideoGetOneOutput} from "@/modules/videos/types";
import { AlertTriangle } from "lucide-react";


interface VideoBannerProps{
    status: VideoGetOneOutput["muxStatus"]
}

export const VideoBanner = ({status}:VideoBannerProps) => {
    if(status === "ready"){
        return null;
    }

    return (
        <div className="bg-yellow-500 py-3 px-4 rounded-b-xl flex items-center gap-2">
            <AlertTriangle className="size-4 text-black shrink-0" />
            <p className="text-black text-sm font-medium line-clamp-1">
                This video is still processing. Please check back soon.
            </p>
        </div>
    )
}