
"use client"
import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import VideoPlayer, { VideoPlayerSkeleton } from "../components/video-player"
import { VideoBanner } from "../components/video-banner"
import { VideoTopRow, VideoTopRowSkeleton } from "../components/video-top-row"
import { useAuth } from "@clerk/nextjs"



interface VideoSectionProps{
    videoId: string
}

const VideoSection = ({videoId}:VideoSectionProps) => {
    

    return <Suspense fallback={<VideoSectionSkeleton />}>
        <ErrorBoundary fallback={<p>error</p>}>
            <VideoSectionInner videoId={videoId} />
        </ErrorBoundary>
    </Suspense>
    
}

const VideoSectionSkeleton = () => {
    return (
        <>
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
      </>
    )
}


const VideoSectionInner = ({videoId}:VideoSectionProps) => {
    const [video] = trpc.videos.getOne.useSuspenseQuery({id: videoId});
    const {isSignedIn } = useAuth(); 
    const utils = trpc.useUtils();

    const createView=trpc.videoViews.create.useMutation({
        onSuccess:()=>{
            utils.videos.getOne.invalidate({id:videoId})
        }
    })

    const handlePlay = () => {
        if(isSignedIn){
            createView.mutate({videoId})
        }
    }

    return (
        <>
        {/* VIDEO PLAYER */}
        {/* show only if ready */}
        <div className={cn("aspect-video bg-black rounded-xl relative overflow-hidden", video.muxStatus !== "ready" && "rounded-none")}>
          <VideoPlayer 
          autoPlay={true}
          playbackId={video.muxPlaybackId}
          posterUrl={video.thumbnailUrl}
          videoId={videoId}
          onPlay={handlePlay}
          />  
    
       
        </div>
          <VideoBanner status={video.muxStatus}></VideoBanner>
          <VideoTopRow video={video} />
        </>
    )
}

export default VideoSection;