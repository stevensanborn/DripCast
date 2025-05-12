"use client"
import { formatDurationSecs } from "@/lib/utils"
import { useState, useRef, useCallback } from "react"

import { useEffect } from "react"
import ReactPlayer from "react-player"
import { UiMonetization } from "@/modules/studio/ui/sections/monetization-section"

interface MonetizationTimelineProps {
    playbackId: string,
    playerRef: React.RefObject<ReactPlayer | null>,
    selectedMonetization: UiMonetization | null,
    onChangeStartTime: (time:number,monetization:UiMonetization)=>void,
    onChangeEndTime: (time:number,monetization:UiMonetization)=>void
}
interface StoryboardJSON {
    tile_width: number;
    tile_height: number;
    tiles: Array<{ x: number; y: number; /* ...other fields */ }>;
    // ...other fields as needed
  }

type Thumb = {
  x: number;
  y: number;
  scale: number;
};

export const MonetizationTimeline = ({ playbackId, playerRef, selectedMonetization, onChangeStartTime, onChangeEndTime }: MonetizationTimelineProps) => {

    const [storyboardJSON, setStoryboardJSON] = useState<StoryboardJSON | null>(null)
    // const [storyboardImage, setStoryboardImage] = useState<HTMLImageElement | null>(null)
    // const [scale, setScale] = useState<number>(0.25)
    const SCALE = 0.25
    const mouseLineRef = useRef<HTMLDivElement | null>(null)
    const TIMELINE_PADDING = 8
    const refLeftLimit = useRef<HTMLDivElement | null>(null)
    const refRightLimit = useRef<HTMLDivElement | null>(null)
    const refSpan = useRef<HTMLDivElement | null>(null)
    const videoLineRef = useRef<HTMLDivElement | null>(null)
    const [thumbs, setThumbs] = useState<Thumb[]>([])
    const [thumbnailWidth, setThumbnailWidth] = useState<number>(0)
    const [thumbnailHeight, setThumbnailHeight] = useState<number>(0)
    const timelineRef = useRef<HTMLDivElement>(null)
    const imgSrc = `https://image.mux.com/${playbackId}/storyboard.webp?format=webp`

    const getStoryboardJSON = async () => {
        const response = await fetch(`https://image.mux.com/${playbackId}/storyboard.json?format=webp`)
        const data = await response.json()
        return data
    }

    const getStoryboardImage = async () => {
        return new Promise((resolve) => {
            const image = new Image()
            image.src = imgSrc
            image.onload = () => {
                resolve(image)
            }
        })
    }

    const onFrameFunction = useCallback(() => {
        if(playerRef.current ){
            const timelineRect = timelineRef.current!.getBoundingClientRect()
            videoLineRef.current!.style.left = `${ (playerRef.current?.getCurrentTime()/playerRef.current!.getDuration()) * timelineRect.width + TIMELINE_PADDING}px`
        }
    }, [playerRef])

    useEffect(() => {
        getStoryboardJSON().then((data) => {
            setStoryboardJSON(data)
        })
        getStoryboardImage()

    }, [ ])

    const handleMouseDownTimeline=()=>{
        const clickedTime=new Date().getTime()
        const timelineRect = timelineRef.current?.getBoundingClientRect()
       
        const onMouseUp = (e: MouseEvent) => {
            if(clickedTime+200 > new Date().getTime()){
                
                const pos = getPosition(e.clientX)
                playerRef.current!.seekTo(pos / timelineRect!.width, 'fraction')
            }
            // window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
        
        window.addEventListener('mouseup', onMouseUp)
        // window.addEventListener('mousemove', onMouseMove)
     
    }
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, side: string) => {
        const timelineRect = timelineRef.current?.getBoundingClientRect()
        let startX = e.clientX
        
      
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
        
        const onMouseMove = (e: MouseEvent) => {
            
            if (side == 'left') {
                const left = refSpan.current!.style.left == '' ? 0 : parseInt(refSpan.current!.style.left)
                const deltaX = e.clientX - startX
                startX = e.clientX
                let pos = left + deltaX
                pos = Math.min(Math.max(0, pos), timelineRect!.width)
                refSpan.current!.style.left = `${pos}px`
                if (playerRef.current) {
                    const time = Math.floor(pos / timelineRect!.width * playerRef.current!.getDuration() * 100) / 100
                    playerRef.current.seekTo(pos / timelineRect!.width,'fraction')
                    // console.log('time',time)
                    if(selectedMonetization){
                        onChangeStartTime(time,selectedMonetization)
                    }
                }

            } else {
                const right = refSpan.current!.style.right == '' ? 0 : parseInt(refSpan.current!.style.right)
                const deltaX = e.clientX - startX
                startX = e.clientX
                let pos = right - deltaX
                pos = Math.min(Math.max(0, pos), timelineRect!.width)
                refSpan.current!.style.right = `${pos}px`
                if (playerRef.current) {
                    const time = (1 - pos / timelineRect!.width) * playerRef.current!.getDuration()
                    playerRef.current.seekTo(pos / timelineRect!.width,'fraction')
                    if(selectedMonetization){
                        onChangeEndTime(time,selectedMonetization)
                    }
                }
            }
            
        }
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('mousemove', onMouseMove)
    }, [selectedMonetization,onChangeStartTime,onChangeEndTime,playerRef])

    const setThumbsArray = useCallback(() => {
        if (!timelineRef.current || !storyboardJSON) return

        const tw = storyboardJSON.tile_width * SCALE
        const th = storyboardJSON.tile_height * SCALE
        const clientRect = timelineRef.current.getBoundingClientRect()
       
        let numTiles = Math.round(clientRect.width / tw)
        if (numTiles > storyboardJSON.tiles.length) {
            numTiles = storyboardJSON.tiles.length
        }

        const width = Math.round(clientRect.width / numTiles)
        const height = Math.round(th / tw * width)
        setThumbnailWidth(width)
        setThumbnailHeight(height)
        const newthumbs:Thumb[] = []
        for (let i = 0; i < numTiles; i++) {
            const index = Math.floor(i * numTiles / storyboardJSON.tiles.length)
            newthumbs.push({ ...storyboardJSON.tiles[index], scale: width / storyboardJSON.tile_width })
        }
        setThumbs(newthumbs)
    }, [storyboardJSON])

    useEffect(() => {
        setThumbsArray()
        let tFrame = 0
       
        const onFrame = () => {
           onFrameFunction()
            tFrame = requestAnimationFrame(onFrame)
        }
        tFrame = requestAnimationFrame(onFrame)
        
        if (storyboardJSON) {
            const resizeObserver = new ResizeObserver(setThumbsArray)
            resizeObserver.observe(timelineRef.current as Element)
            return () => {
                resizeObserver.disconnect()
                cancelAnimationFrame(tFrame)
            }
        }
        //setup and animation of the timeline
        
        return () => {
            console.log('onFrame cancel')
        }
    }, [storyboardJSON])

    const getPosition=(x:number)=>{
        const timelineRect = timelineRef.current?.getBoundingClientRect()
        if (!timelineRect) return 0
        let pos = x - timelineRect.left
        pos = Math.max(0, pos)
        pos = Math.min(pos, timelineRect.width)
        return pos
    }
    

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const timelineRect = timelineRef.current?.getBoundingClientRect()
        if (mouseLineRef?.current && timelineRect) {
            const pos = getPosition(e.clientX)
            mouseLineRef.current.style.left = `${pos + TIMELINE_PADDING}px`
            const time = playerRef.current!.getDuration() * pos / timelineRect.width
            mouseLineRef.current.firstElementChild!.innerHTML = `${formatDurationSecs(time)}`
        }
    }, [playerRef,mouseLineRef])


     useEffect(()=>{
        const timelineRect = timelineRef.current?.getBoundingClientRect()
       
        if(selectedMonetization && timelineRect){
            const startTime = selectedMonetization.startTime??'0'
            const endTime = selectedMonetization.endTime??playerRef.current!.getDuration().toString()
            const posStart = parseFloat(startTime)/playerRef.current!.getDuration()*timelineRect.width
            const posEnd = parseFloat(endTime)/playerRef.current!.getDuration()*timelineRect.width
            refSpan.current!.style.left = `${posStart + TIMELINE_PADDING}px`
            refSpan.current!.style.right = `${timelineRect.width - posEnd }px`
        }
     }, [selectedMonetization,refSpan,playerRef])

   

    return (
        <div className="relative monetization-timeline-container flex w-full my-4 " onMouseMove={handleMouseMove}  onMouseDown={handleMouseDownTimeline} >

            <div className="mx-2 w-full flex justify-start overflow-x-auto overflow-visible border-[1px] flex-1 no-scrollbar border-muted-foreground relative" ref={timelineRef}>
                <div className="flex justify-start relative overflow-visible  " >
                    {
                        storyboardJSON &&
                        thumbs.map((v, index: number) => {
                            return (<div key={'tile-'+index} className="relative">
                                <div className="relative overflow-hidden drag-none bg-black/60  select-none pointer-events-none"
                                    style={{
                                        width: thumbnailWidth,
                                        height: thumbnailHeight,
                                        minWidth: thumbnailWidth,
                                        minHeight: thumbnailHeight,
                                    }}>

                                    <img src={imgSrc} alt={""} className="pointer-events-none absolute w-max h-max max-w-none drag-none opacity-50 sepia-[0.85] hover:sepia-0 transition-all duration-300"
                                        style={{
                                            left: -v.x * v.scale,
                                            top: -v.y * v.scale,
                                            transform: `scale(${v.scale})`,
                                            transformOrigin: 'top left',
                                        }} />

                                </div>
                                <div className={"absolute h-[10px] bottom-0 w-[1px] bg-muted-foreground left-0 "+(index==0 && 'hidden')}>
                                </div>
                                <div  className="absolute top-0 h-[10px] w-[1px] bg-muted-foreground left-1/2"></div>
                            </div>)
                        })
                    }
                </div>

            </div>
            <div className="h-full w-2 bg-muted-foreground absolute top-0 left-0 bottom-0 rounded-l-full"></div>
            <div className="h-full w-2 bg-muted-foreground absolute top-0 right-0 bottom-0 rounded-r-full"></div>
            
            <div ref={mouseLineRef} className="mouse-line absolute top-0 left-0 bottom-0 w-[1px] bg-muted-foreground overflow-visible flex-none" >
                <div className="absolute text-xs text-muted-foreground" style={{ top: '-20px' }}></div>
            </div>
            <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-red-500/50 video-line" ref={videoLineRef}></div>
           {selectedMonetization && (
            <div className="absolute top-0 left-0 bottom-0 right-0  bg-muted-foreground/20 rounded-xl border-[1px] border-dripcast_blue" ref={refSpan}>
                <div className="absolute top-0 left-0 bottom-0 w-[9px] bg-dripcast_blue rounded-l-full cursor-pointer flex items-center justify-center" ref={refLeftLimit}
                    onMouseDown={(e) => handleMouseDown(e, 'left')}
                >
                    
                </div>
                <div className="absolute top-0 right-0 bottom-0 w-[9px] bg-dripcast_blue rounded-r-full cursor-pointer flex items-center justify-center" ref={refRightLimit}
                    onMouseDown={(e) => handleMouseDown(e, 'right')}
                ></div>
            </div>
           )}
            
        </div>
    )
}