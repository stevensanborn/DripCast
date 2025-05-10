"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { monetization } from "@/db/schema"
import { Form, FormField, FormLabel, FormMessage, FormControl, FormItem, FormDescription } from "@/components/ui/form"
import { z } from "zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"


import { Label } from "@/components/ui/label"
import { StudioGetOneOutput } from "@/modules/studio/types"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import { useForm,  } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import ReactVideoPlayer from "@/modules/videos/ui/components/react-video-player"
import ReactPlayer from "react-player"

// import { useSearchParams } from 'next/navigation'

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRightIcon, Banknote, BanknoteIcon } from "lucide-react"
import { motion, useDragControls , animate, useMotionValue } from "framer-motion"
import { cn, getHexHash, getMonetizationType } from "@/lib/utils"
import { initializeMonetization, updateMonetizationOnChain } from "@/modules/solana/monetization"
import { SolanaState } from "@/components/solana/solana-state"
import { sleep } from "@trpc/server/unstable-core-do-not-import"

interface MonetizationFormProps {
    videoId: string
    video: StudioGetOneOutput
    selectedMonetization?: typeof monetization.$inferSelect | null
    onClose: () => void
}

export const MonetizationForm = ({ videoId, video, selectedMonetization, onClose }: MonetizationFormProps) => {
    // const searchParams = useSearchParams()
    // const type = searchParams.get("type")
    const utils = trpc.useUtils();

    const refPage1 = useRef<HTMLDivElement>(null)
    const refPage2 = useRef<HTMLDivElement>(null)

    const refVideoPlayer = useRef<ReactPlayer>(null)
    const [duration, setDuration] = useState(0)
    const [autoPlay, setAutoPlay] = useState(false)
    const [hover, setHover] = useState(false)
    const insertMonetization = trpc.monetization.create.useMutation({
        onSuccess: () => {
            toast.success("Monetization created")
            utils.monetization.getMany.invalidate({ videoId })
            utils.studio.getOne.invalidate({ id: videoId })
            
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const updateMonetization = trpc.monetization.update.useMutation({
        onSuccess: () => {
            toast.success("Monetization updated")
            utils.monetization.getMany.invalidate({ videoId })
            utils.studio.getOne.invalidate({ id: videoId })
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const createTransaction = trpc.monetization.createTransaction.useMutation({
        onSuccess: () => {
            toast.success("Transaction created ")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const onSuccessCreateMonetization = async ( m: typeof monetization.$inferSelect) => {
        console.log(m)
        // insertMonetization.mutate({
        //     ...m,
        //     duration: m.duration ?? "0",
        //     creatorKey: SolanaState.wallet?.publicKey?.toBase58() ?? "",
        //     type: m.type as "purchase" | "snippet" | "payperminute"
        // })
        
            // console.log("monetizationId", monetizationId)
            
            // //save on chain
            // let tx = await initializeMonetization(video,m); 

            // //create transaction
            // createTransaction.mutate({
            //     monetizationId: monetizationId,
            //     transactionId: tx
            // })

            
    }
    const dragControls = useDragControls();
    const dragControls2 = useDragControls();
    const handleX = useMotionValue(0);
    const handleX2 = useMotionValue(0);
    const refBar = useRef<HTMLDivElement>(null)
    const startRef = useRef<HTMLDivElement>(null)
    const endRef = useRef<HTMLDivElement>(null)
    const refProgressBar = useRef<HTMLDivElement>(null)

    const  zodStartTime = z.string().min(1).refine((data) => (data !== "0"),{
        message: "Start time must be greater than 0",
    })

    const zodCost = z.string().min(1).refine((data) => (data !== "0"),{
        message: "Cost must be greater than 0",
    })

    const formScheme = z.object({
        videoId: z.string().min(1),
        type: z.string().min(1),
        title: z.string().min(1),
        cost: zodCost,
        description: z.string(),
        startTime:zodStartTime,
        endTime: z.string().min(0),
        duration: z.string(),
        creatorKey: z.string(),
    })

    const formCurrent = useForm<z.infer<typeof formScheme>>({
        defaultValues: {
            videoId: videoId,
            type: selectedMonetization?.type ?? 'purchase',
            title: selectedMonetization?.title ?? "",
            description: selectedMonetization?.description ?? "",
            cost: selectedMonetization?.cost ?? "0",
            startTime: selectedMonetization?.startTime ?? "0",
            endTime: selectedMonetization?.endTime ?? "0",
            duration: selectedMonetization?.duration ?? "",
            creatorKey: selectedMonetization?.creatorKey ?? "",
        },
        resolver: zodResolver(formScheme)
    })

    // listen to the startTime and endTime
    useEffect(() => {
        const { unsubscribe } = formCurrent.watch((value) => {
            console.log(value)
            if (duration > 0) {
                if(Number(value.endTime) > duration){
                    console.log("endTime is greater than duration")
                    formCurrent.setValue("endTime", duration.toString())
                }
          
            }
        })
        return () => {
            unsubscribe()
        }
    }, [formCurrent, duration])

    useEffect(() => {
        handleX2.set((refBar.current?.clientWidth ?? 10) - 10)
    },[refBar.current])

    const onSubmit = async (data: z.infer<typeof formScheme>) => {
        // console.log(data)
        let m = data as typeof monetization.$inferSelect;
       
        if (selectedMonetization) {
            console.log("updating monetization ",m)
           let tx = await updateMonetizationOnChain(video,{...m,id:selectedMonetization.id})
           toast.success("Monetization updating...... "+tx)

            updateMonetization.mutate({
                ...data,
                creatorKey: SolanaState.wallet?.publicKey?.toBase58() ?? "",
                type: data.type as "purchase" | "snippet" | "payperminute",
                id: selectedMonetization.id
            }, {
                onSuccess: () => {
                    toast.success("Monetization updated")
                    utils.monetization.getMany.invalidate({ videoId })
                    utils.studio.getOne.invalidate({ id: videoId })
                    onClose()
                },
                onError: (error) => {
                    toast.error(error.message)
                }
            })
        }
        else {
            
          
           await insertMonetization.mutateAsync({
                ...m,
                duration: m.duration=="" ? "0" : m.duration,
                creatorKey: SolanaState.wallet?.publicKey?.toBase58() ?? "",
                type: m.type as "purchase" | "snippet" | "payperminute"
            },{
                onSuccess: (data) => {
                    let monetizationId = data[0].id
                    console.log("monetizationId", monetizationId)
                    
            // //save on chain
               initializeMonetization(video,{...m,id:monetizationId!},(tx:string)=>{
                createTransaction.mutate({
                    monetizationId: monetizationId!,
                    transactionId: tx
                })
                onClose()
                })
                } 
            });

            // //cr}eate transaction
            
           
         
           
        }
    }
    const scrollToElementWithFramerMotion = (element: HTMLElement, duration = 0.8) => {
        const start = element.parentElement?.scrollLeft ?? 0;
        const end = element.getBoundingClientRect().left;
        
        animate(start, end, {
            duration,
            ease: [0.42, 0, 0.58, 1], // cubic-bezier for easeInOut
            onUpdate: (latest) => element.parentElement?.scrollTo(latest, 0),
            onComplete: () => {
                console.log("onComplete", end)
                if(end>0){
                    setAutoPlay(true)
                }
            }
        });
    };

    return (
        <div className="w-full flex flex-col gap-2 items-start ">
                <div className="text-sm font-light text-gray-300"> [ { getMonetizationType(formCurrent.watch("type"))} ]</div>
                <Form {...formCurrent}>

                    <form onSubmit={formCurrent.handleSubmit(onSubmit)} className="w-full h-full">

                        <div className="min-w-full flex-nowrap inline-flex justify-star  items-center overflow-hidden gap-x-4 min-h-full no-scrollbar">
                            <motion.div className={cn("w-auto min-w-full inline-block h-[80vh]", selectedMonetization ? "hidden" : "")} ref={refPage1}>

                                <div className={cn("flex flex-col gap-2 justify-start items-start ")}>
                                    <p className="text-lg font-bold">Choose a Type</p>
                                    <FormField control={formCurrent.control} name="type" render={({}) => (
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroup defaultValue="purchase" onValueChange={(value) => {
                                                    formCurrent.setValue("type", value)
                                                }} >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="purchase" className="w-4 h-4 m-2" id="purchase">Purchase</RadioGroupItem>
                                                        <Label htmlFor="purchase" className=" text-lg" >Purchase <div className="text-sm text-gray-500">Users will be able to purchase the video</div></Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="snippet" className="w-4 h-4 m-2" id="snippet">Snippet</RadioGroupItem>
                                                        <Label htmlFor="snippet" className="text-lg">Snippet <div className="text-sm text-gray-500">Users will be able to purchase a snippet of the video</div></Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="payperminute" className="w-4 h-4 m-2" id="payperminute">Pay Per Minute</RadioGroupItem>
                                                        <Label htmlFor="payperminute" className="text-lg ">Pay Per Minute <div className="text-sm text-gray-500">Users will be able to purchase the video for a certain amount of time</div></Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )} />

                                    <Button variant="outline" className="w-auto" onClick={(e) => {
                                        e.preventDefault()
                                        
                                        if (refPage2.current) {
                                            scrollToElementWithFramerMotion(refPage2.current);
                                            
                                        }
                                    }}>Continue <ArrowRightIcon className="w-4 h-4" /></Button>
                                </div>


                            </motion.div>
                            <motion.div className="min-w-full max-w-4xl inline-block h-[80vh] overflow-y-auto no-scrollbar" 
                                ref={refPage2}
                                initial={{ opacity: 0, left: 100 }}
                                whileInView={{ opacity: 1, left: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >

                                <div className="flex items-center justify-center w-full my-0" onMouseOver={() => {
                                    console.log("mouse over")
                                    setHover(true)
                                }} onMouseOut={() => {
                                    setHover(false) 
                                }} >
                                    <div className={`max-h-[200px] h-[200px]   aspect-video relative ${formCurrent.watch("type") === "payperminute" ? "mb-2 " : "mb-6"}`}>
                                        <ReactVideoPlayer
                                            videoId={videoId}
                                            playbackId={video.muxPlaybackId}
                                            posterUrl={video.thumbnailUrl}
                                            ref={refVideoPlayer}
                                            onDuration={(duration) => {
                                                setDuration(duration)
                                                formCurrent.setValue("endTime",duration.toString())
                                            }}
                                            controls={true}
                                            autoPlay={autoPlay}
                                        />
                                        <div className={`w-full  top-full duration-300 mt-2 absolute bottom-0 left-0 right-0 ${formCurrent.watch("type") === "payperminute" ? "hidden" : ""}`} 
                                        style={{height: hover ? "30px" : "10px"}}
                                        >
                                            
                                            <div className="absolute bottom-0 top-0 left-0 right-0 h-full" ref={refBar}  
                                                   >
                                                <div className={`h-full  bg-gradient-to-b  from-gray-500 to-gray-700 absolute top-0 left-0 right-0 rounded-md `}  
                                                 
                                                > </div>
                                            </div>

                                            <div className="absolute bottom-0 top-0 left-0 right-0 h-full" ref={refProgressBar} >
                                                <div  className={`h-full  bg-gradient-to-b  from-coral to-indian_red  absolute top-0 left-0 w-full rounded-md drop-shadow-md drop-shadow-black border-y-2 border-dripcast_blue text-xs flex items-center justify-center overflow-hidden `} >
                                                    
                                                </div>
                                            </div>
                                               
                                               <motion.div 
                                               ref={startRef}
                                               drag="x"
                                               dragElastic={0.08}
                                               dragMomentum={false}
                                               dragControls={dragControls}
                                               dragTransition={{ bounceDamping: 30, bounceStiffness: 800 }}
                                               dragConstraints={{ left: 0, right: ((refBar.current ? refBar.current.clientWidth:0  )- 10 ) }}
                                               style={{ x: handleX }}
                                               onUpdate={
                                                 (e) => {
                                                    
                                                    if(refBar.current && refProgressBar.current && endRef.current){
                                                        const width =refBar.current.clientWidth
                                                        const left = Number(e.x)
                                                        if(left> handleX2.get()){
                                                            handleX2.set(left)
                                                        }
                                                        refProgressBar.current.style.left = (left +5 )  + 'px'
                                                        refProgressBar.current.style.width = (handleX2.get() - left)  + 'px'
                                                        if(duration > 0){
                                                            const percentage = left / width
                                                            const time = Math.round( duration * percentage *100) / 100
                                                            formCurrent.setValue("startTime",time.toString())
                                                            refVideoPlayer.current?.seekTo(percentage,"fraction")
                                                        }
                                                    }
                                                 }
                                               }
                                             
                                               className="absolute w-[10px] h-full left-0 top-0 bg-dripcast_blue rounded-l-lg cursor-pointer  border-dripcast_blue border-[1px] drop-shadow-md drop-shadow-black" ></motion.div>

                                               <motion.div 
                                               ref={endRef}
                                               drag="x"
                                               dragElastic={0.08}
                                               dragMomentum={false}
                                               dragControls={dragControls2}
                                               dragTransition={{ bounceDamping: 30, bounceStiffness: 800 }}
                                               dragConstraints={{ left: 0, right: ((refBar.current ? refBar.current.clientWidth:0  )- 10 ) }}
                                               style={{ x: handleX2 }}
                                               onUpdate={
                                                 (e) => {

                                                     if(refBar.current && refProgressBar.current && endRef.current){
                                                        const width =refBar.current.clientWidth
                                                        const left = Number(e.x)
                                                        if(left < handleX.get()){
                                                            handleX.set(left)
                                                        }
                                                        refProgressBar.current.style.left = (handleX.get() +5 )  + 'px'
                                                        refProgressBar.current.style.width = ( left-handleX.get())  + 'px'
                                                        if(duration > 0){
                                                            const percentage = left / width
                                                            const time = Math.round( duration * percentage *100) / 100
                                                            formCurrent.setValue("endTime",time.toString())
                                                            refVideoPlayer.current?.seekTo(percentage,"fraction")
                                                        }
                                                    }
                                                 }
                                               }
                                             
                                               className="absolute w-[10px] h-full left-0 top-0 bg-dripcast_blue rounded-r-lg cursor-pointer border-dripcast_blue border-[1px]  drop-shadow drop-shadow-black" ></motion.div>


                                        </div>
                                    </div>
                                  
                                </div>

                                <div className="flex gap-x-4 justify-start items-start flex-wrap p-2">

                                    <div className="flex flex-col gap-2 flex-1 ">

                                        <FormField control={formCurrent.control} name="title" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Title" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={formCurrent.control} name="description" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-foreground-muted">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field}
                                                        placeholder="Description"
                                                        value={field.value ?? ""}
                                                        rows={4}
                                                        className="resize-none pr-10"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                    </div>
                                    <div className="flex flex-col gap-2 flex-1 ">
                                        <FormField control={formCurrent.control} name="cost" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-foreground-muted">Set Price</FormLabel>
                                                <FormDescription>
                                                        {formCurrent.watch("type" ) ==="purchase" && <p>Set the price of the video</p>}
                                                        {formCurrent.watch("type" ) ==="snippet" &&  <p>Set the price of the snippet</p>}
                                                        {formCurrent.watch("type" ) ==="payperminute" &&  <p>Set the price of the video per minute</p>}
                                                </FormDescription>
                                                <FormControl  >
                                                    <Input {...field} placeholder="Cost" type="number" className="w-32" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        
                                       <div className={cn(" flex-row gap-2   justify-start items-start ",  formCurrent.watch("type") !== "payperminute" ? "flex" : "hidden")}>
                                        <div className="flex flex-col gap-2 ">
                                            <FormField control={formCurrent.control} name="startTime" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-foreground-muted">Start (secs)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Start Time" value={field.value ?? ""} className="w-16"  />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>

                                            )} />
                                            
                                        </div>


                                        <div className={cn(" flex-col gap-2  ml-5 ",  formCurrent.watch("type") === "snippet" ? "flex" : "hidden")}>
                                            {duration > 0 && (
                                                <>
                                                    <FormField control={formCurrent.control} name="endTime" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-foreground-muted">End (secs)</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="End Time" value={field.value ?? duration} className="w-16" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </>
                                            )}
                                        </div>


                                        </div>
                                       <div className={cn(formCurrent.watch("type") === "payperminute" ? "hidden" : "")} >
                                        <FormField control={formCurrent.control} name="duration" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-foreground-muted">Duration</FormLabel>
                                                <FormDescription>Set the duration of how long each purchase will be valid for. Leave empty for unlimited. </FormDescription>
                                                <FormControl  >
                                                    <Input {...field} placeholder="Duration" type="number" className="w-32" />
                                                </FormControl>
                                                <FormMessage />                                     
                                            </FormItem>
                                        )} />
                                        </div>
                                        
                                    </div>

                                  

                                </div>
                                <div className="flex flex-row gap-2 mt-4 ">
                                    {!selectedMonetization &&
                                    <Button variant="outline" onClick={(e) => {
                                        e.preventDefault()
                                        setAutoPlay(false)
                                        if (refPage1.current) {
                                            scrollToElementWithFramerMotion(refPage1.current);
                                        }
                                    }}>
                                        Back
                                    </Button>
                                    }
                                    <Button type="submit" disabled={insertMonetization.isPending || updateMonetization.isPending}>
                                        Save
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </form>
                </Form>
           
        </div>
    )
}