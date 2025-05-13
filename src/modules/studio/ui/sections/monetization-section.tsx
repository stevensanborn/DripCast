"use client"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense, useState, useRef, useEffect, useCallback } from "react"
import { trpc } from "@/trpc/client"
import ReactVideoPlayer from "@/modules/videos/ui/components/react-video-player"
import { Button } from "@/components/ui/button"
import {  CircleChevronLeftIcon, PlusIcon, SaveIcon, TrashIcon } from "lucide-react"
import ReactPlayer from "react-player"
import { monetization } from "@/db/schema"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Link from "next/link"
import { MonetizationTimeline } from "@/modules/monetization/ui/components/monetization-timeline"
import { closeMonetization, initializeMonetization, updateMonetizationOnChain } from "@/modules/solana/monetization"
import { SolanaState } from "@/components/solana/solana-state"
import { Separator } from "@radix-ui/react-separator"

interface MonetizationSectionProps {
    videoId: string
}

export type UiMonetization = typeof monetization.$inferSelect 

export const MonetizationSectionContent = ({videoId}:MonetizationSectionProps) => {
    
    const utils = trpc.useUtils();

    const [video] = trpc.studio.getOne.useSuspenseQuery({id: videoId})
    const [monetizations] = trpc.monetization.getMany.useSuspenseQuery({videoId})
    // const [categories] = trpc.categories.getMany.useSuspenseQuery()
    const refVideoPlayer = useRef<ReactPlayer>(null)
    
    const [duration,setDuration] = useState(0)
    const [uiMonetizations,setUiMonetizations] = useState<UiMonetization[]>([])
    const [selectedMonetization,setSelectedMonetization] = useState<UiMonetization | null>(null)
    const [priceSOLUSD,setPriceSOLUSD] = useState(0)
    const [priceUSD,setPriceUSD] = useState("")

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
    const removeMonetization = trpc.monetization.remove.useMutation({
        onSuccess: () => {
          utils.monetization.getMany.invalidate()
          toast.success("Monetization deleted")
        },
        onError: (error) => {
         toast.error(error.message)
        }
    })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
    const formScheme = z.object({
        id: z.string(),
        title: z.string().min(2),
        description: z.string(),
        videoId: z.string(),
        type: z.enum(['purchase', 'snippet', 'payperminute']),
        cost: z.string().min(1).transform(val => parseInt(val, 10)),
        startTime: z.string().nullable().transform(v => v === "" ? null : v),
        endTime: z.string().nullable().transform(v => v === "" ? null : v),
        txId: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
        duration: z.string().min(1).transform(val =>  parseInt(val, 10)),
        creatorKey: z.string()
    })
    
    // const form = useForm<z.infer<typeof formScheme>>({
    //     defaultValues: {
    //         id: '',
    //         title: '',
    //         description: '',
    //         videoId: '',
    //         type: 'payperminute',
    //         cost: 0,
    //         startTime: '',
    //         endTime: '',
    //         txId: '',
    //         duration: 0,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //         creatorKey: ''
    //     }
    // })
    const getPrice=async()=>{
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setPriceSOLUSD(data.solana.usd)
       
    }
    useEffect(() => {
        getPrice()
    }, [])
 
    const formCurrent = useForm<z.infer<typeof formScheme>>({mode:"onChange"})

    const onSubmit = async (data: z.infer<typeof formScheme>) => {
        let errors = false
        if(data.title.length < 2){
            formCurrent.setError('title',{message:"Title is required"})
            errors = true
        }

        if(!data.startTime){
            formCurrent.setError('startTime',{message:"Start is required"})
            errors = true
        }
        if (data.startTime && isNaN(Number(data.startTime))) {
            formCurrent.setError('startTime', { message: "Start is not a number" });
            errors = true;
        }
        if(data.endTime  && isNaN(Number(data.endTime))){
            formCurrent.setError('endTime',{message:"End is not a number"})
            errors = true
        }

        if(data.cost == 0 || data.cost < 0.0001){
            formCurrent.setError('cost',{message:"A minimum of 0.0001 SOL is required"})
            errors = true
        }

        if(errors){
            return
        }

        if(data.id.indexOf('temp') !== -1){
            console.log('data',data)
            type InsertMonetizationInput = Omit<z.infer<typeof formScheme>, "id"> & { type: "purchase" | "snippet" | "payperminute", creatorKey: string };

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = data;
            const d:InsertMonetizationInput = {
                ...rest,
                cost: data.cost * 1_000_000_000, //CONVERSION FROM SOL TO LAMPORT
                type: data.type as "purchase" | "snippet" | "payperminute",
                creatorKey: SolanaState.wallet?.publicKey?.toBase58() ?? "",
            }
           

            //inster into db
            console.log('d',d)
            await insertMonetization.mutateAsync(d,{
                onSuccess: (result) => {
                    
                    const monetizationId = result[0].id
                    console.log("monetizationId", monetizationId)
                    
                    //save on chain
                    initializeMonetization(video,{...d,id:monetizationId!},(tx:string)=>{
                        createTransaction.mutate({
                            monetizationId: monetizationId!,
                            transactionId: tx
                        })
                    })
                } 
            });
        }else {
            data.cost = data.cost * 1_000_000_000 //CONVERSION FROM SOL TO LAMPORT
            updateMonetizationOnChain(video,{...data,
            },(tx:string)=>{
                toast.success("Monetization updating...... "+tx)
                data.txId = tx
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const  {createdAt,updatedAt, ...rest} = data
                console.log('data',rest)
                
                updateMonetization.mutate(rest,{
                    onSuccess: () => {
                        toast.success("Monetization updated")
                        utils.monetization.getMany.invalidate({ videoId })
                        utils.studio.getOne.invalidate({ id: videoId })
                    },
                    onError: (error) => {
                        console.log("error",error)
                        toast.error(error.message)
                    }
                })

                createTransaction.mutate({
                    monetizationId: data.id,
                    transactionId: tx
                })


            })
           
        }
    }
    useEffect(() => {
        if(selectedMonetization){
        formCurrent.reset(
            {
                id: selectedMonetization.id,
                title: selectedMonetization.title,
                description: selectedMonetization.description??"",
                videoId: selectedMonetization?.videoId,
                type: selectedMonetization?.type,
                cost: selectedMonetization?.cost,
                startTime: selectedMonetization?.startTime??undefined,
                endTime: selectedMonetization?.endTime??undefined,
                duration: selectedMonetization?.duration??undefined,
                txId: selectedMonetization?.txId,
                createdAt: selectedMonetization?.createdAt,
                updatedAt: selectedMonetization?.updatedAt,
            }
        )
    }
    }, [formCurrent,selectedMonetization])

    useEffect(() => {
        //copy monetizations over ot and array 
        setUiMonetizations(monetizations.map((monetization) =>{
            return {...monetization,
                cost: monetization.cost/1_000_000_000   
            }
            } ))
    }, [monetizations])


    useEffect(() => {
        console.log('selectedMonetization',selectedMonetization)
        const { unsubscribe } = formCurrent.watch((value) => {
            
            const usdPric=priceSOLUSD * (value.cost??0)
            
            setPriceUSD(usdPric.toFixed(3))
            if(selectedMonetization){
                selectedMonetization.title = value.title??""
                selectedMonetization.description = value.description??""
                selectedMonetization.startTime = value.startTime??""
                selectedMonetization.endTime = value.endTime??""
                selectedMonetization.duration = value.duration??0
                selectedMonetization.cost = value.cost??0
            }
        })
        
        return () => unsubscribe()
      }, [formCurrent.watch,priceSOLUSD])

    const onChangeStartTime = useCallback( (t:number,monetization:UiMonetization)=>{
        if(monetization){
            monetization.startTime = t.toString()
            formCurrent.setValue('startTime',t.toString())
        }
    },[formCurrent])
    
    const onChangeEndTime = useCallback((t:number,monetization:UiMonetization)=>{
        if(monetization){
            console.log(t)
            monetization.endTime = t.toString()
            formCurrent.setValue('endTime',t.toString())
        }
    },[formCurrent])

return (
    
    <div className="w-full flex flex-col">
    <div className="flex items-start">
        <Link href={`/studio/videos/${videoId}`}>
        <Button variant={"ghost"} size={"icon"} className="mr-2" ><CircleChevronLeftIcon></CircleChevronLeftIcon></Button></Link><h1 className="text-2xl font-bold">Monetization</h1>
    </div>
    <div className="w-full flex justify-evenly">
        <div className="w-1/2 flex flex-col ">
            <div className="flex items-center justify-between mt-2">
                <Button variant="outline" onClick={() => {
                    setUiMonetizations([...uiMonetizations, {
                        title: 'New Monetization - '+(uiMonetizations.length+1),
                        videoId: videoId,
                        type: 'snippet',
                        cost: 0,
                        startTime: '',
                        endTime: `${duration}`,
                        description: '',
                        creatorKey: '',
                        updatedAt: new Date(),
                        createdAt: new Date(),
                        txId: '',
                        duration: 0,
                        id: 'temp-'+(uiMonetizations.length+1)
                    }])
                }} >
                    <PlusIcon className="size-4 mr-2"></PlusIcon>
                    Create Monetization
                </Button>
               
            </div>
            <div className="flex flex-col items-start gap-2 mt-4 mr-4">
                    {uiMonetizations.length === 0 && (
                        <div className="text-sm text-muted-foreground">No monetizations found</div>
                    )}
                    {

                        uiMonetizations.map((monetization) => (
                            <div key={'ui'+monetization.id} 
                            className={"flex w-full gap-2 cursor-pointer items-center hover:bg-primary/10 rounded-sm border-solid bg-muted border-[1px] p-3 " + (selectedMonetization?.id === monetization.id ? ' bg-primary/5 border-[#03E4FF]' : '')} onClick={() => {
                                setSelectedMonetization(monetization)
                            }}>
                                
                                <p className="text-sm font-bold flex-1">{monetization.title}</p>
                                
                                <Button variant="outline" size="icon" onClick={async (e) => {
                                    e.stopPropagation()
                                    console.log('save monetization',monetization.id)
                                    //  let out = await formCurrent.trigger()
                                     
                                    console.log('formCurrent',formCurrent.formState.errors,formCurrent.formState.isValid)
                                    formCurrent.handleSubmit(onSubmit)()
                                    
                                }}>
                                    <SaveIcon className="size-4"></SaveIcon>
                                </Button>
                                <Button variant="outline" size="icon" onClick={async (e) => {
                                    e.stopPropagation()
                                    if(monetization.id.indexOf('temp') !== -1){
                                        setSelectedMonetization(null)
                                        setUiMonetizations(uiMonetizations.filter((m) => m.id !== monetization.id))
                                        setSelectedMonetization(null)
                                    }else {

                                        try{
                                            closeMonetization(video,monetization,(tx:string)=>{
                                                removeMonetization.mutate({id:monetization.id})
                                                toast.success("Monetization closed "+tx)
                                            })
                                   
                                            setSelectedMonetization(null)
                                            console.log('delete monetization',monetization.id)
                                            
                                            }
                                            catch(e: Error | unknown){
                                                const error = e instanceof Error ? e : new Error('An unknown error occurred');
                                                toast.error(error.message)
                                                setSelectedMonetization(null)
                                            }
                                           
                                            
                                       
                                    }
                                }}>
                                    <TrashIcon className="size-4"></TrashIcon>
                                </Button>
                            </div>
                        ))
                    }
                </div>
        </div>
        <div className="w-1/2 aspect-video rounded-lg overflow-hidden">
                    <ReactVideoPlayer
                        videoId={videoId}
                        playbackId={video.muxPlaybackId}
                        posterUrl={video.thumbnailUrl}
                        ref={refVideoPlayer}
                        onDuration={(duration) => {
                            setDuration(duration)
                        }}
                        controls={true}
                        autoPlay={true}
                    />
        </div>

    </div>
    <div className="w-full flex flex-col">
        <div className="w-full">
                <MonetizationTimeline playbackId={video.muxPlaybackId ?? ""} playerRef={refVideoPlayer} 
                selectedMonetization={selectedMonetization}
                onChangeStartTime={onChangeStartTime}
                onChangeEndTime={onChangeEndTime}
                ></MonetizationTimeline>
        </div>
    </div>
    <div className="w-full flex flex-col">
    <Form {...formCurrent}>
    <form onSubmit={formCurrent.handleSubmit(onSubmit)} className="space-y-8">
    {   selectedMonetization ? (
            <>
                <div className="w-full flex items-start justify-evenly">
                            <div className="flex flex-col w-1/2">
                            
                                            <FormField control={formCurrent.control} name="title" render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                            <Input {...field} placeholder="Title"  value={field.value ?? ""}  />
                                            </FormControl>
                                            <FormMessage ></FormMessage>
                                            </FormItem>
                                            )}/>

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
                            
                            <div className="flex flex-col w-1/2 ml-4">
                                
                                <div className="flex  gap-4 justify-start">
                                                <FormField control={formCurrent.control} name="startTime" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-foreground-muted">Start (secs)</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Start Time" value={field.value ?? ""} className="w-24"  />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <div className="ml-2">
                                                <FormField control={formCurrent.control} name="endTime" render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs text-foreground-muted">End (secs)</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="End Time" value={field.value ?? duration} className="w-24" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        </div>

                                </div>
                                <div  >
                                <FormField control={formCurrent.control} name="duration" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-foreground-muted">Duration</FormLabel>
                                        <FormDescription>Set the duration of how long each purchase will be valid for. Leave empty for unlimited. </FormDescription>
                                        <FormControl  >
                                            <Input {...field} placeholder="Duration" className="w-32"  value={field.value ?? ""} /> 
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                </div>
                                <div  >
                                <FormField control={formCurrent.control} name="cost" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs text-foreground-muted">Cost</FormLabel>
                                        <FormDescription>Enter the cost of this purchase. Priced in Sol.  </FormDescription>
                                        <FormControl  >
                                            <Input {...field} placeholder="0" className="w-32"  value={field.value ?? ""} /> 
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} /><span className="text-xs text-foreground-muted"> ${priceUSD}</span>
                                </div>
                            

                            </div>
                            
                </div>
                <div>
                    <Separator orientation="horizontal" className="w-full my-4" />
                    <h1>Txs:</h1>
                </div>
            </>
            ) : (

                <p className="text-md text-muted-foreground">No monetization selected. Choose one from the list or create a new one.</p>
            )}
            <Button type="submit">Submit</Button>
            </form>
        </Form> 
    </div>

    </div>
)
}




export const MonetizationSection = ({videoId}:MonetizationSectionProps) => {
    return (
    <Suspense fallback={<MonetizationSectionSkeleton />}> 
    <ErrorBoundary fallback={<p>Error</p>}>
        <MonetizationSectionContent videoId={videoId} />
        </ErrorBoundary>
    </Suspense>
    )
}

const MonetizationSectionSkeleton = () => {
    return (
        <div>
            <p>Loading...</p>
        </div>
    )
}



