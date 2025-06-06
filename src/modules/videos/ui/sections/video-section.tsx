
"use client"


import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
// import VideoPlayer, { VideoPlayerSkeleton } from "../components/video-player"
import { VideoBanner } from "../components/video-banner"
import { VideoTopRow, VideoTopRowSkeleton } from "../components/video-top-row"
import { useAuth } from "@clerk/nextjs"
import { MonetizationThumbs } from "../components/monetization-thumbs"
import VideoClientPlayer, { VideoPlayerSkeleton } from "../components/video-client-player"
import { monetization, monetizationPayments } from "@/db/schema"
import { saveMonetizationState } from "@/modules/solana/monetization"



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
    const [monetizations] = trpc.monetization.getMany.useSuspenseQuery({videoId})
    const [payments] = trpc.monetization.getMonetizationPayments.useSuspenseQuery({videoId})
    const [paymentTrigger,setPaymentTrigger] = useState(0)
    
    const {isSignedIn } = useAuth(); 
    const utils = trpc.useUtils();

    const createView=trpc.videoViews.create.useMutation({
        onSuccess:()=>{
            utils.videos.getOne.invalidate({id:videoId})
        }
    })

    const createPayment = trpc.monetization.createPayment.useMutation({

        onSuccess:()=>{
            console.log("Payment created");
            utils.monetization.getMonetizationPayments.invalidate({videoId})
            
        },
        onError:(error)=>{
            console.log(error);
        }
    });
    
    const purchaseMonetization = (m:typeof monetization.$inferSelect)=>{
    
        saveMonetizationState(m, async(tx:string)=>{
            await createPayment.mutateAsync({
                monetizationId:m.id,
                transactionId:tx,
                amount:Number(m.cost)
            });
        });
    
      }

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
          <VideoClientPlayer 
          autoPlay={true}
          playbackId={video.muxPlaybackId}
          posterUrl={video.thumbnailUrl}
          videoId={videoId}
          onPlay={handlePlay}
          muted={true}
          monetizations={monetizations}
          payments={payments as typeof monetizationPayments.$inferSelect[]}
          purchaseMonetization={purchaseMonetization}
          paymentTrigger={paymentTrigger}
          />  
    
       
        </div>
          <VideoBanner status={video.muxStatus}></VideoBanner>
            <MonetizationThumbs onClickThumb={(monetization)=>{
                //check if the monetization is already paid
                const isPaid = payments.find((payment)=>payment.monetizationId === monetization.id)
                if(isPaid){
                    //play the video
                    handlePlay()
                }else{
                    
                }
            }} monetizations={monetizations as typeof monetization.$inferSelect[]} payments={payments as typeof monetizationPayments.$inferSelect[]}
            purchaseMonetization={purchaseMonetization}
            paymentTrigger={paymentTrigger}
            setPaymentTrigger={setPaymentTrigger}
            />
          <VideoTopRow video={video} />
        </>
    )
}

export default VideoSection;