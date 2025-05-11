"use client"

import React, { useEffect, useCallback,   useRef, useState } from "react";
import { THUMBNAIL_FALLBACK_URL } from "../../constants";
import ReactPlayer from "react-player";
import { monetization, monetizationPayments } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import { trpc } from "@/trpc/client"
import { initializeMonetization } from "@/modules/solana/monetizationState";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface VideoClientPlayerProps{
    videoId:string;
    playbackId?:string | null| undefined;
    posterUrl?:string | null| undefined;
    autoPlay?:boolean;
    controls?:boolean;
    onPlay?:()=>void;
    onDuration?:(duration:number)=>void;
    muted?:boolean;
    monetizations: typeof monetization.$inferSelect[];
    payments: typeof monetizationPayments.$inferSelect[];
}

export const VideoPlayerSkeleton = () => {
    return (
        <div className="aspect-video  bg-black rounded-xl" />
    )
}

const VideoClientPlayer =  React.forwardRef((
    {videoId,playbackId,posterUrl,autoPlay,onPlay,onDuration,controls=true,muted=false,monetizations,payments}:VideoClientPlayerProps,ref:React.Ref<ReactPlayer>) => {
 
    const [playing,setPlaying] = useState(autoPlay);
    const scrubberRef = useRef<HTMLDivElement>(null);
    const scrubberBarRef = useRef<HTMLDivElement>(null);
    const scrubberBarProgressRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationRef = useRef<number>(0);
    const durationRef = useRef<number>(0);
    const refIsScrubbing = useRef<boolean>(false);
    const paywallRef = useRef<HTMLDivElement>(null);
    const [paywallMonetizations,setPaywallMonetizations] = useState<typeof monetization.$inferSelect[]>([]);
    const utils = trpc.useUtils();

    //type of monetization to tell what mode we are going to use 
    const [monetizationType,setMonetizationType] = useState<"" | "payperminute" | "multi"| "single">("");
  
    const createPayment = trpc.monetization.createPayment.useMutation({

        onSuccess:()=>{
            console.log("Payment created");
            utils.monetization.getMonetizationPayments.invalidate({videoId})
            
        },
        onError:(error)=>{
            console.log(error);
        }
    });

  const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => { setHasMounted(true);  }, []);

    useEffect(()=>{
       if(paywallMonetizations.length > 0){
         if(!paywallCheck(videoRef.current!.currentTime)){
            paywallRef.current!.style.display = "none";
            //play the video
            videoRef.current!.play();
         }
       }
    },[payments])
  useEffect(()=>{
    let type: "" | "payperminute" | "multi" | "single" |"snippet" = "";
    monetizations.forEach((monetization)=>{
        if(monetization.type === "purchase"){
            type = (type=="snippet") ? "multi" : "single";
        }
        if(monetization.type === "payperminute"){
            type="payperminute";
        }
        if(monetization.type === "snippet"){
            type = (type=="single")? "multi" : "snippet";
        }
    })
    
    setMonetizationType(type);
  },[monetizations]);

  const rangeBoundScrubber = (pos:number)=>{
    return  Math.min(Math.max(0,pos),scrubberBarRef.current!.offsetWidth - scrubberRef.current!.offsetWidth);
  }

  const handleScrubberMouseDown = (e:React.MouseEvent<HTMLDivElement>)=>{
    let eleVideo = videoRef.current;
    let startX = e.clientX;
    let startPosX = scrubberRef.current!.offsetLeft;
    let startPaused = eleVideo!.paused;
    refIsScrubbing.current = true;

    const handleScrubberMouseMove = (e:MouseEvent)=>{
        
        //set position of scrubber
        eleVideo!.pause();
        setPlaying(false);
        let pos = startPosX + (e.clientX - startX);
        pos = rangeBoundScrubber(pos);
        
        scrubberRef.current!.style.left = `${pos}px`;
        scrubberBarProgressRef.current!.style.left = `${pos}px`;
       let time = (pos/scrubberBarRef.current!.offsetWidth)*durationRef.current;
        if(!paywallCheck(time)){
            eleVideo!.currentTime = time;
            paywallRef.current!.style.display = "none";
        }
    }
    const handleScrubberMouseUp = (e:MouseEvent)=>{
        
        refIsScrubbing.current = false;
        if(!startPaused){
            eleVideo!.play();
        }
        window.removeEventListener("mousemove",handleScrubberMouseMove);
        window.removeEventListener("mouseup",handleScrubberMouseUp);
    }
    window.addEventListener("mouseup",handleScrubberMouseUp);
    window.addEventListener("mousemove",handleScrubberMouseMove);
  }

  const handleScrubberMouseUp = (e:React.MouseEvent<HTMLDivElement>)=>{
    // console.log(e.clientX);
  }
  const handleScubberBarClick = (e:React.MouseEvent<HTMLDivElement>)=>{
     var rect = scrubberBarRef.current!.getBoundingClientRect();
     const pos = rangeBoundScrubber(e.clientX - rect.left - scrubberRef.current!.offsetWidth/2);
    
    //get percent progress
    const percentProgress = (pos/(rect.width - scrubberRef.current!.offsetWidth));
    //get scrubber progress
    videoRef.current!.currentTime = percentProgress*durationRef.current;
  }
  
  const paywallCheck= useCallback((time:number)=>{
    
    if(!monetizations || monetizations.length === 0) return;
    
    if(!videoRef.current) return;


    let isPaywallVisible = false;
    let seekTime = videoRef.current!.currentTime;

    // console.log("ds"+monetizationType,monetizations.length);
    let overlapingMonetizations:typeof monetization.$inferSelect[] = [];
    monetizations.forEach((monetization)=>{
        //is within the range of the monetization
        if(monetization.type === "purchase" && monetizationType === "single"){
            if(time >= Number(monetization.startTime) ){
                //check if there is an existing payment for this monetization
                let isPaid = false;
                payments.forEach((payment)=>{
                    if(payment.monetizationId === monetization.id){
                        isPaid = true;
                    }
                })
                if(!isPaid){
                    isPaywallVisible = false;
                    isPaywallVisible = true;
                    seekTime = Number(monetization.startTime) ;
                    overlapingMonetizations.push(monetization);
                }
                

            }
            
        }
    })
    if(isPaywallVisible){
        paywallRef.current!.style.display = "block";
        videoRef.current!.currentTime = seekTime;
        setPaywallMonetizations(overlapingMonetizations);
    }else{
        // paywallRef.current!.style.display = "none";
    } 
    return isPaywallVisible;
        
  },[monetizations,monetizationType,payments])
   
  const purchaseMonetization = (m:typeof monetization.$inferSelect)=>{
    
    initializeMonetization(m, async(tx:string)=>{
        await createPayment.mutateAsync({
            monetizationId:m.id,
            transactionId:tx,
            amount:Number(m.cost)
        });

    });

 


  }


  const animateFrame = useCallback((timestamp:number) => {
    if(scrubberRef.current 
        && videoRef.current 
        && durationRef.current&& durationRef.current>0
        && scrubberBarRef.current
        
        ){
            
        //percent progress
        const eleVideo = videoRef.current;
        if( !refIsScrubbing.current){
        const percentProgress = (eleVideo.currentTime/durationRef.current)*100;
        const scrubberWidth = scrubberBarRef!.current!.offsetWidth - scrubberRef.current!.offsetWidth;
        const scrubberProgress = (percentProgress/100)*scrubberWidth ;
        scrubberRef.current.style.left = `${scrubberProgress}px`; 
        scrubberBarProgressRef.current!.style.left = `${scrubberProgress}px`; 
        }

        //check if the paywall is visible
        if(paywallCheck(eleVideo.currentTime)){
            eleVideo.pause();
            setPlaying(false);
        }
    }
    animationRef.current = requestAnimationFrame(animateFrame);

  },[monetizations,monetizationType,payments])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateFrame);
    return () =>{ cancelAnimationFrame(animationRef.current);}}, [animateFrame]);

  const getScrubberPositionBasedOnTime = (time:number)=>{
    if(scrubberBarRef.current && durationRef.current){
    const scrubberWidth = scrubberBarRef.current!.offsetWidth - scrubberRef.current!.offsetWidth + 12;
    const scrubberProgress = (time/durationRef.current)*scrubberWidth ;
    return scrubberProgress;
    }
    return 0;
  };

    return (

        <div className="aspect-video bg-black rounded-xl relative overflow-hidden cursor-pointer video-client-player" ref={containerRef}>
            <div className="w-full h-full ">
                {hasMounted && (
            <ReactPlayer url={`https://stream.mux.com/${playbackId}.m3u8`}
                className={"w-full h-full object-cover "+videoId}
                poster={posterUrl || THUMBNAIL_FALLBACK_URL}
                playing={playing}
                muted={muted}
                controls={false}
                width="100%"
                height="100%"
                onPlay={onPlay}
                ref={ref}
                onError={(error)=>{
                    console.log(error);
                }}
            
                onDuration={(duration)=>{
                    if(containerRef.current){
                      let videoElement = containerRef.current.querySelector("video")
                      if(videoElement){
                        videoRef.current = videoElement as HTMLVideoElement;
                      }
                    }
                    durationRef.current = duration;
                    if(onDuration){
                        onDuration(duration);
                    }
                  
                }}
            />)}
             <div className="paywall w-full h-full absolute top-0 left-0 bg-black/50 bg-gradient-to-bl from-black/50 to-black/80   hidden" ref={paywallRef} >
                <div className="flex flex-col w-full h-full justify-center items-center">
                    <Card >
                    <CardHeader>
                    <CardTitle>Purchase this content</CardTitle>
                   <CardDescription>
                   To access this content, consider the following options
                   </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hasMounted && paywallMonetizations.map((monetization)=>{
                            return (
                                <div className=" flex flex-col items-start space-y-4 rounded-md border p-4" key={"paywall-"+monetization.id}>

                                <p className="text-sm font-medium leading-none">{monetization.title}</p>
                                <p className="text-sm text-muted-foreground leading-none">{monetization.description}</p>
                                 <Button variant="outline" key={"paywall-"+monetization.id} className="rounded-full" 
                                    onClick={()=>{
                                        purchaseMonetization(monetization);
                                    }}>Purchase </Button>
                                </div>
                            )
                        })}
                   </CardContent>
                   </Card>
                </div>
            </div>
            </div>
            <div className="controls bottom-[-var(--video-player-controls-height)] w-full left-0 right-0 absolute h-[var(--video-player-controls-height)] transition-all duration-300 opacity-0">
                    <div className="flex flex-col  w-full px-2 relative">
                        <div className="scrubber-container w-full  relative">
                            <div className="scrubber-progress bg-cyan-400/80 rounded-lg h-1/2 w-full absolute left-0 cursor-pointer" ref={scrubberBarRef} onClick={handleScubberBarClick}></div>
                            <div className="scrubber-progress bg-white/80 rounded-lg h-1/2 w-auto absolute left-0 right-0 pointer-events-none " ref={scrubberBarProgressRef}></div>
                            
                            <div className="scrubber bg-red-500 drop-shadow-lg z-10 rounded-full h-[var(--video-player-scrubber-dot-size)] w-[var(--video-player-scrubber-dot-size)] absolute " ref={scrubberRef} 
                            onMouseDown={handleScrubberMouseDown}
                            onMouseUp={handleScrubberMouseUp}
                            >
                                <div className="w-full h-full flex justify-center items-center"><div className=" scrubber-dot w-1 h-1 bg-white rounded-full opacity-0 scale-0"></div></div>
                            </div>
                            <div className="monetization-indicatior-container absolute top-1/2 left-0 w-full h-1/2">
                            {
                           hasMounted && monetizations.map((monetization)=>{
                                return (
                                    monetization.type === "purchase" && (
                                        <div   key={"bar"+monetization.id} className="monetization-bar   bg-gray-500/50 absolute h-full  right-0 " style={{left:getScrubberPositionBasedOnTime(Number(monetization.startTime))}} >
                                            <div className="monetization-bar-line bg-white/80  h-full w-[1px]  absolute left-0  pointer-events-none " ></div>
                                            <div className="monetization-bar-line bg-white/80  h-full w-[1px]  absolute right-0  pointer-events-none " ></div>
                                        </div>
                                    )
                                )
                            }
                            )
                            }
                           
                            </div>
                        </div>
                           
                    </div>
                   
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" className="rounded-2xl overflow-hidden" onClick={
                            (e)=>{
                                e.preventDefault();
                                setPlaying(!playing);
                            }
                        }>
                            {playing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </Button>

                    </div>
                    </div>
                </div>
           
        
    )
})
VideoClientPlayer.displayName = "VideoClientPlayer";
export default VideoClientPlayer;