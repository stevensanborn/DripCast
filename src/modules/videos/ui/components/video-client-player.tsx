"use client"

import React, { useEffect, useCallback,   useRef, useState, useMemo } from "react";
import { THUMBNAIL_FALLBACK_URL } from "../../constants";
import ReactPlayer from "react-player";
import { monetization, monetizationPayments } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon, VolumeOffIcon, VolumeIcon } from "lucide-react";
import { cn, timeLeftForPayment } from "@/lib/utils";

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
    paymentTrigger: number;
}

export const VideoPlayerSkeleton = () => {
    return (
        <div className="aspect-video  bg-black rounded-xl" />
    )
}

const VideoClientPlayer =  React.forwardRef((
    {videoId,playbackId,posterUrl,autoPlay,onPlay,onDuration,muted=false,monetizations,payments,purchaseMonetization,paymentTrigger}:VideoClientPlayerProps,ref:React.Ref<ReactPlayer>) => {
 
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
    
    //type of monetization to tell what mode we are going to use 
    const [monetizationType,setMonetizationType] = useState<"" | "payperminute" | "multi"| "single">("");
  
    
    const getPaymentsForMonetization = useMemo( ()=>{
        return (m:typeof monetization.$inferSelect)=>payments.filter((payment)=>payment.monetizationId === m.id).sort((a,b)=>new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },[payments])

    const hasValidPaymentsForMonetization = useMemo( ()=>{return (m:typeof monetization.$inferSelect)=>{
            const pays = getPaymentsForMonetization(m)
            if(pays.length > 0){
                //check if there is a payment that is not expired
                if(m.duration === 0){
                    return true;
                }else{
                    return timeLeftForPayment(m,pays[0])>0;
                }
            }
            return false;
        }
    },[getPaymentsForMonetization,paymentTrigger])


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
                //check if the payment is expired
               
                    const paymentsForMonetization = getPaymentsForMonetization(monetization);
                 if(paymentsForMonetization.length > 0){
                    if(monetization.duration === 0){
                        isPaid = true;
                    }else{
                    paymentsForMonetization.forEach((p)=>{
                      //check if the payment is expired
                      if(timeLeftForPayment(monetization,p) > 0){
                        isPaid = true;
                      }
                    })
                    }
                }
                
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
    const timestamp = new Date().getTime();
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
            const pos = rangeBoundScrubber(startPosX);
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
                playsinline={true}
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
                    { hasMounted &&  paywallMonetizations.map((monetization)=>{
                   return (<Card key={"paywall-"+monetization.id}>
                   <CardHeader>
                   <CardTitle className="text-sm">Purchase - {monetization.title}</CardTitle>
                   <CardDescription className="text-xs">
                   To purchase this content, please click the button below.
                   </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className=" flex flex-col items-start space-y-4 rounded-md border p-4" key={"paywall-"+monetization.id}>
                        <p className="text-xs text-muted-foreground">{monetization.description}</p>
                        <p className="text-xs text-muted-foreground">Cost: <span className="text-dripcast_blue">{monetization.cost/1_000_000_000} SOL</span></p>
                            <Button variant="outline" key={"paywall-"+monetization.id} className="rounded-full" 
                            onClick={()=>{
                                purchaseMonetization(monetization);
                            }}>Purchase </Button>
                        </div>
                    
                       
                   </CardContent>
                   </Card>
                   )})}
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
                                        <div   
                                            key={"bar"+monetization.id} 
                                            className={cn("monetization-bar  absolute h-full  rounded-full right-0 cursor-pointer",
                                                hasValidPaymentsForMonetization(monetization) ? "bg-green-700/50 border-[1px] border-white" : "bg-crayola_red"
                                            )}
                                            style={{
                                                left:getScrubberPositionBasedOnTime(Number(monetization.startTime)),
                                                right:getRightScrubberPositionBasedOnTime(Number(monetization.endTime))
                                            }} >
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