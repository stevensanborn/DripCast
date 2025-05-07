"use client"

import React from "react";
import { THUMBNAIL_FALLBACK_URL } from "../../constants";
import ReactPlayer from "react-player";

interface VideoPlayerProps{
    videoId:string;
    playbackId?:string | null| undefined;
    posterUrl?:string | null| undefined;
    autoPlay?:boolean;
    controls?:boolean;
    onPlay?:()=>void;
    onDuration?:(duration:number)=>void;
    muted?:boolean;
}

export const VideoPlayerSkeleton = () => {
    return (
        <div className="aspect-video  bg-black rounded-xl">
        </div>
    )
}

const VideoPlayer =  React.forwardRef(({videoId,playbackId,posterUrl,autoPlay,onPlay,onDuration,controls=true,muted=false}:VideoPlayerProps,ref:React.Ref<ReactPlayer>) => {
    
    

    return (
            
            <ReactPlayer url={`https://stream.mux.com/${playbackId}.m3u8`}
                className={"w-full h-full object-cover "+videoId}
                poster={posterUrl || THUMBNAIL_FALLBACK_URL}
                playing={autoPlay}
                muted={muted}
                controls={controls}
                width="100%"
                height="100%"
                onPlay={onPlay}
                ref={ref}
                onError={(error)=>{
                    console.log(error);
                }}
                onProgress={(progress)=>{
                   
                }}
                onDuration={(duration)=>{
                    if(onDuration){
                        console.log(duration)
                        onDuration(duration);
                    }
                }}
                
            />
        
    )
})

export default VideoPlayer;