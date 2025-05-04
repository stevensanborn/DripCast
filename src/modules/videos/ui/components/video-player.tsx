"use client"
import MuxPlayer from "@mux/mux-player-react"
import { THUMBNAIL_FALLBACK_URL } from "../../constants";
import { useRef } from "react";

interface VideoPlayerProps{
    videoId:string;
    playbackId?:string | null| undefined;
    posterUrl?:string | null| undefined;
    autoPlay?:boolean;
    onPlay?:()=>void;
}

export const VideoPlayerSkeleton = () => {
    return (
        <div className="aspect-video  bg-black rounded-xl">
        </div>
    )
}

const VideoPlayer = ({videoId,playbackId,posterUrl,autoPlay,onPlay}:VideoPlayerProps) => {
    
    const ref = useRef<typeof MuxPlayer>(null);
    console.log(ref.current);
    return (
        
            <MuxPlayer
            
            playbackId={playbackId ?? ""}
            poster={posterUrl || THUMBNAIL_FALLBACK_URL}
            playerInitTime={0}
            thumbnailTime={0}
            onPlay={onPlay}
            autoPlay={autoPlay}
            className={"w-full h-full object-cover "+videoId}
            accentColor="#FF2056"
            onError={(error) => {
                // console.error(error);
                console.log(error);
            }}
            style={{
                '--media-object-fit': 'cover',
            } as React.CSSProperties}
            />
        
    )
}

export default VideoPlayer;