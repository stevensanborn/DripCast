"use client"

import React, { useEffect, useCallback,   useRef, useState } from "react";
import { THUMBNAIL_FALLBACK_URL } from "../../constants";
import ReactPlayer from "react-player";
import { monetization, monetizationPayments } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon, VolumeOffIcon, VolumeIcon } from "lucide-react";
import { trpc } from "@/trpc/client"

// import { initializeMonetization } from "@/modules/solana/monetizationState";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { saveMonetizationState } from "@/modules/solana/monetization";


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
    purchaseMonetization: (m: typeof monetization.$inferSelect) => void;
}

export const VideoPlayerSkeleton = () => {
    return (
        <div className="aspect-video  bg-black rounded-xl" />
    )
}

const VideoClientPlayer =  React.forwardRef((
    {videoId,playbackId,posterUrl,autoPlay,onPlay,onDuration,muted=false,monetizations,payments,purchaseMonetization}:VideoClientPlayerProps,ref:React.Ref<ReactPlayer>) => {
 
    const [playing,setPlaying] = useState(autoPlay);
    const [isMuted,setIsMuted] = useState(muted);
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
  
    // const createPayment = trpc.monetization.createPayment.useMutation({

    //     onSuccess:()=>{
    //         console.log("Payment created");
    //         utils.monetization.getMonetizationPayments.invalidate({videoId})
            
    //     },
    //     onError:(error)=>{
    //         console.log(error);
    //     }
    // });


  
  const paywallCheck= useCallback((time:number)=>{
    
    if(!monetizations || monetizations.length === 0) return;
    
    if(!videoRef.current) return;


    let isPaywallVisible = false;
    let seekTime = videoRef.current!.currentTime;

    // console.log("ds"+monetizationType,monetizations.length);
    const overlapingMonetizations:typeof monetization.$inferSelect[] = [];
    
    if(monetizations.length ==0 ) return false;

    monetizations.forEach((monetization)=>{
        //is within the range of the monetization
        if(monetization.type === "purchase" || monetization.type === "snippet"){
            let endTime = Number(monetization.endTime);
            if(endTime === 0){
                endTime = durationRef.current!;
            }
            if(time >= Number(monetization.startTime) && time <= endTime){
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
  },[payments,paywallMonetizations.length,paywallCheck])
  
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
    const eleVideo = videoRef.current;
    const startX = e.clientX;
    // console.log(e.clientX,scrubberRef.current!.parentElement?.getBoundingClientRect(),scrubberRef.current!.offsetLeft);
    const startPosX =e.clientX - scrubberRef.current!.parentElement!.getBoundingClientRect().x - scrubberRef.current!.offsetWidth/2;
    const startPaused = eleVideo!.paused;
    refIsScrubbing.current = true;
    let timestamp = new Date().getTime();
    const handleScrubberMouseMove = (e:MouseEvent)=>{
        
        //set position of scrubber
        eleVideo!.pause();
        setPlaying(false);
        let pos = startPosX + (e.clientX - startX);
        pos = rangeBoundScrubber(pos);
        
        scrubberRef.current!.style.left = `${pos}px`;
        scrubberBarProgressRef.current!.style.left = `${pos}px`;
        const time = (pos/scrubberBarRef.current!.offsetWidth)*durationRef.current;
        if(!paywallCheck(time)){
            eleVideo!.currentTime = time;
            paywallRef.current!.style.display = "none";
        }
    }
    const handleScrubberMouseUp = ()=>{
        //see if time is more than 100ms
        if(new Date().getTime() - timestamp < 200){
            //click 
            let pos = rangeBoundScrubber(startPosX);
            scrubberRef.current!.style.left = `${pos}px`;
            scrubberBarProgressRef.current!.style.left = `${pos}px`;
            const time = (pos/scrubberBarRef.current!.offsetWidth)*durationRef.current;
            if(!paywallCheck(time)){
                eleVideo!.currentTime = time;
                paywallRef.current!.style.display = "none";
            }
        }
        

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

  const handleScrubberMouseUp = ()=>{
    // console.log(e.clientX);
  }
  const handleScubberBarClick = (e:React.MouseEvent<HTMLDivElement>)=>{
     const rect = scrubberBarRef.current!.getBoundingClientRect();
     const pos = rangeBoundScrubber(e.clientX - rect.left - scrubberRef.current!.offsetWidth/2);
    
    //get percent progress
    const percentProgress = (pos/(rect.width - scrubberRef.current!.offsetWidth));
    //get scrubber progress
    videoRef.current!.currentTime = percentProgress*durationRef.current;
  }
  


  const animateFrame = useCallback(() => {
    if(scrubberRef.current 
        && videoRef.current 
        && durationRef.current&& durationRef.current>0
        && scrubberBarRef.current
        
        ){
            
        //percent progress
        const eleVideo = videoRef.current;
        if( !refIsScrubbing.current){
        const percentProgress = (eleVideo.currentTime/durationRef.current)*100;
        const scrubberWidth = scrubberBarRef!.current!.offsetWidth - (scrubberRef.current!.offsetWidth-1);
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

  },[paywallCheck])

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

  const getRightScrubberPositionBasedOnTime = (time:number)=>{
    const left = getScrubberPositionBasedOnTime(time);
    const right = scrubberBarRef.current!.offsetWidth - left;
    return right;
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
                autoPlay={autoPlay}
                ref={ref}
                onError={(error)=>{
                    console.log(error);
                }}
            
                onDuration={(duration)=>{
                    if(containerRef.current){
                      const videoElement = containerRef.current.querySelector("video")
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
                    { hasMounted &&(
                   <Card >
                   <CardHeader>
                   <CardTitle className="text-sm">Purchase</CardTitle>
                   <CardDescription className="text-xs">
                   To access this content, consider the following options
                   </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {paywallMonetizations.map((monetization)=>{
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
                   )}
                </div>
            </div>
            </div>
            <div className="controls bottom-0 w-full left-0 right-0 absolute  transition-all duration-300 opacity-1 h-[var(--video-player-controls-height)]">
                    <div className="flex flex-col  w-full px-2 relative h  ">
                        <div className="scrubber-container w-full  relative  h-[var(--video-player-scrubber-height)]" onMouseDown={handleScrubberMouseDown} >
                            <div className="scrubber-progress bg-dripcast_blue/80 rounded-lg h-full w-full absolute left-0 cursor-pointer" ref={scrubberBarRef} onClick={handleScubberBarClick}></div>
                            <div className="scrubber-progress bg-white/80 rounded-lg h-full w-auto absolute left-0 right-0 pointer-events-none " ref={scrubberBarProgressRef}></div>
                            
                            <div className="scrubber bg-gray-800 z-10 top-0 scale-110 rounded-full  h-[var(--video-player-scrubber-height)] w-[var(--video-player-scrubber-height)] absolute " ref={scrubberRef} 
                            onMouseDown={handleScrubberMouseDown}
                            onMouseUp={handleScrubberMouseUp}
                            >
                                <div className="w-full h-full flex justify-center items-center"><div className="   scrubber-dot w-1 h-1 bg-white rounded-full opacity-0 scale-0"></div></div>
                            </div>
                            <div className="monetization-indicatior-container absolute top-0 left-0 w-full h-full rounded-full">
                            {
                           hasMounted && monetizations.map((monetization)=>{
                                return (
                                    monetization.type === "snippet" && (
                                        <div   key={"bar"+monetization.id} className="monetization-bar   bg-crayola_red absolute h-full  rounded-full right-0 cursor-pointer" 
                                        style={{left:getScrubberPositionBasedOnTime(Number(monetization.startTime)),right:getRightScrubberPositionBasedOnTime(Number(monetization.endTime))}} >
                                            {/* <div className="monetization-bar-line bg-crayola_red/80  h-full w-[1px]  absolute left-0  pointer-events-none " ></div>
                                            <div className="monetization-bar-line bg-crayola_red/80  h-full w-[1px]  absolute right-0  pointer-events-none " ></div> */}
                                        </div>
                                    )
                                )
                            }
                            )
                            }
                           
                            </div>
                        </div>
                           
                    </div>
                   
                    <div className="flex items-center justify-start gap-2 ml-2 mb-1">
                        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden" onClick={
                            (e)=>{
                                e.preventDefault();
                                setPlaying(!playing);
                            }
                        }>
                            {playing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        </Button>

                        <Button variant="ghost" size="icon" className="rounded-full overflow-hidden" onClick={
                            (e)=>{
                                e.preventDefault();
                                setIsMuted(!isMuted);
                            }
                        }>
                            {isMuted ? <VolumeOffIcon className="w-4 h-4" /> : <VolumeIcon className="w-4 h-4" />}
                        </Button>

                    </div>
                    </div>
                </div>
           
        
    )
})
VideoClientPlayer.displayName = "VideoClientPlayer";
export default VideoClientPlayer;