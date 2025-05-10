"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { trpc } from "@/trpc/client"
import {  MoreVerticalIcon, CopyIcon, TrashIcon, CheckIcon, Globe2Icon, LockIcon, ImagePlusIcon, RotateCcw, SparklesIcon, RefreshCcw, PlusIcon, PencilIcon } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { monetization, videoUpdateSchema } from "@/db/schema"
import { z } from "zod"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation";
import VideoPlayer from "@/modules/videos/ui/components/video-player"
import { getMonetizationType, snakeCaseToTitleCase } from "@/lib/utils"
import Image from "next/image"
import { THUMBNAIL_FALLBACK_URL } from "@/modules/videos/constants"
import { ThumbnailUploadModal } from "@/modules/studio/ui/components/thumbnail-upload-modal"
import { APP_URL } from "@/constants"
import { ResponsiveModal } from "../components/responsive-modal"
import { MonetizationForm } from "@/modules/monetization/ui/components/monetization-form"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Tooltip } from "@/components/ui/tooltip"
import { closeMonetization } from "@/modules/solana/monetization"


interface FormSectionProps {
    videoId: string
}

export const FormSectionContent = ({videoId}:FormSectionProps) => {
    const router = useRouter();
    const utils = trpc.useUtils();
    const [video] = trpc.studio.getOne.useSuspenseQuery({id: videoId})
    const [monetizations] = trpc.monetization.getMany.useSuspenseQuery({videoId})
    const [categories] = trpc.categories.getMany.useSuspenseQuery()
    const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false)
    const [showMonetization, setShowMonetization] = useState(false)
    const [selectedMonetization, setSelectedMonetization] = useState<typeof monetization.$inferSelect | null>(null)
    
    const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
        onSuccess: () => {
          utils.studio.getMany.invalidate()
          utils.studio.getOne.invalidate({id: videoId})
          toast.success("Thumbnail restored")
        },
        onError: (error) => {
         toast.error(error.message)
        }
    })

    const updateVideo = trpc.videos.update.useMutation({
        onSuccess: () => {
          utils.studio.getMany.invalidate()
          utils.studio.getOne.invalidate({id: videoId})
        },
        onError: (error) => {
         toast.error(error.message)
        }
    })

    const removeVideo = trpc.videos.removeVideo.useMutation({
        onSuccess: () => {
          utils.studio.getMany.invalidate()
          utils.studio.getOne.invalidate({id: videoId})
          toast.success("Video deleted")
          router.push("/studio/")
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
    const revalidateVideo = trpc.videos.revalidate.useMutation({
        onSuccess: () => {
          utils.studio.getMany.invalidate()
          utils.studio.getOne.invalidate({id: videoId})
          toast.success("Video revalidated")
        },
        onError: (error) => {
         toast.error(error.message)
        }
    })

    const form = useForm<z.infer<typeof videoUpdateSchema>>({
        defaultValues: video,
        resolver: zodResolver(videoUpdateSchema)
    })

    const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
        await updateVideo.mutateAsync({
            id: videoId,
            ...data
        })
    }

    const [isCopied, setIsCopied] = useState(false) 
    
    const fullURL = `${APP_URL}/videos/${video.id}`


    const onCopy = async () => {
        await navigator.clipboard.writeText(fullURL)
        setIsCopied(true)
        setTimeout(()=>{
            setIsCopied(false)
        },2000)
    }   

    useEffect(()=>{
        if(selectedMonetization){
            setShowMonetization(true)
        }
    },[selectedMonetization])
    useEffect(()=>{
        if(!showMonetization){
            setSelectedMonetization(null)
        }
    },[showMonetization])

    return (
    <>
    <ThumbnailUploadModal videoId={videoId} open={thumbnailModalOpen} onOpenChange={setThumbnailModalOpen} />
    
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Video Details - {video.title}</h1>
                    <p className="text-sm text-muted-foreground">Manage your video details here</p>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button type="submit" disabled={updateVideo.isPending}>
                        Save
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVerticalIcon></MoreVerticalIcon>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={()=>revalidateVideo.mutate({id:video.id})}> 
                                    <RefreshCcw className="size-4 mr-2"></RefreshCcw>
                                    Revalidate
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={()=>removeVideo.mutate({id:video.id})}> 
                                    <TrashIcon className="size-4 mr-2"></TrashIcon>
                                    Delete
                                </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>

            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-6">
                <div className="space-y-8 col-span-1 lg:col-span-3">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter video title" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field}
                                    placeholder="Enter video description"
                                    value={field.value ?? ""}
                                    rows={6}
                                    className="resize-none pr-10"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="flex items-center justify-start gap-x-2">
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <p className="size-8 bg-slate-50 text-black flex items-center justify-center rounded-full hover:opacity-70"  onClick={()=>setShowMonetization(true)} ><PlusIcon className="size-4 "></PlusIcon></p>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add Monetization</p>
                    </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                        <div>Monetizations</div>
                        
                        {/*  */}
                     
                    </div>
                    <div className="flex  gap-x-2">
                        {monetizations.map((monetization)=>(
                            <div key={monetization.id} 
                                className="flex flex-col items-start justify-start border border-dashed rounded-md border-neutral-400 h-[84px] w-[153px] p-2 relative">
                                <p className="text-xs line-clamp-2 font-bold">{
                                    monetization.title
                                }</p>
                                <p className="text-xs text-muted-foreground">{
                                    getMonetizationType(monetization.type)
                                }</p>
                                <p className="text-xs">{
                                    monetization.cost
                                }</p>
                        <div className="absolute top-1 right-1">
                        <DropdownMenu >
                        <DropdownMenuTrigger asChild >
                            <Button size="icon" className="size-6 flex items-center justify-center rounded-xl" variant="secondary" ><MoreVerticalIcon className="size-2" ></MoreVerticalIcon></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                                <DropdownMenuItem className="cursor-pointer" onClick={()=>{
                                    console.log(monetization)
                                     setSelectedMonetization(monetization)
                                }}> 
                                            <PencilIcon className="size-4 mr-2"></PencilIcon>
                                    Update
                                </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" onClick={async ()=>{

                                            try{
                                            let tx = await closeMonetization(video,monetization)
                                            toast.success("Monetization closed "+tx)
                                            }
                                            catch(e:any){
                                                toast.error(e.message)
                                            }
                                            removeMonetization.mutate({id:monetization.id})
                                            
                                            
                                        }
                                        }> 
                                        <TrashIcon className="size-4 mr-2"></TrashIcon>
                                        Delete
                                    </DropdownMenuItem>
                                    
                        </DropdownMenuContent>
                        </DropdownMenu>
</div>
                            </div>
                        ))}
                    </div>
                    <FormField 
                    control={form.control}
                    name="thumbnailUrl"
                    render={()=>{
                        return (
                            
                            <FormItem>
                                <FormLabel>Thumbnail</FormLabel>
                                <FormControl>
                                        <div className="p-0.5 border border-dashed rounded-md border-neutral-400 relative h-[84px] w-[153px] group">
                                            <Image src={video.thumbnailUrl||THUMBNAIL_FALLBACK_URL} alt="thumbnail" fill className="object-cover rounded-md" />  
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" type="button" size="icon" className="bg-black/50 hover:bg-black/50 absolute top-1 right-1
                                                    rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7">
                                                        <MoreVerticalIcon className="text-white"></MoreVerticalIcon>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem onClick={()=>setThumbnailModalOpen(true)}>
                                                        <ImagePlusIcon className="size-4 mr-2"></ImagePlusIcon>
                                                        Change
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled={true}>
                                                        <SparklesIcon className="size-4 mr-2"></SparklesIcon>
                                                        AI-Generated Thumbnail
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={()=>restoreThumbnail.mutate({id:video.id})}>
                                                        <RotateCcw className="size-4 mr-2"></RotateCcw>
                                                        Restore
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    
                                </FormControl>
                            </FormItem>
                        )
                    }}
                    />

                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <FormMessage />
                        </FormItem>

                        
                    )} />

                    
                </div>
                {/* new column */}
                <div className="flex flex-col gap-y-8 lg:col-span-2 " >
                    <div className="flex flex-col gap-4 rounded-xl overflow-hidden h-fit bg-slate-700" >
                        <div className="relative w-full aspect-video overflow-hidden">
                            <VideoPlayer videoId={videoId}
                                playbackId={video.muxPlaybackId}
                                posterUrl={video.thumbnailUrl}
                            />
                        </div>


                        <div className="p-4 flex flex-col gap-y-6">
                            <div className="flex justify-between items-center gap-x-2">

                                <div className="flex flex-col gap-y-1">
                                    <p className="text-xs text-muted-foreground"> Video Link</p>
                                    <div className="items-center flex gap-x-2">
                                        <Link prefetch  href={`/videos/${video.id}`}>
                                            <p className="text-sm text-blue-500 hover:underline ">
                                                {fullURL}
                                            </p>
                                        </Link>
                                        <Button type="button" variant="ghost" size="icon" onClick={onCopy} className="shrink-0">
                                            {isCopied ? <CheckIcon className="size-4"></CheckIcon> : <CopyIcon className="size-4"></CopyIcon>}
                                        </Button>
                                    </div>
                                </div>
                            </div>


                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-muted-foreground text-xs">Video Status</p>
                                    <p className="text-sm font-medium">
                                         {snakeCaseToTitleCase(video.muxStatus || "preparing...")}
                                    </p>
                                </div>
                            </div>


                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-y-1">
                                    <p className="text-muted-foreground text-xs">Track Status</p>
                                    <p className="text-sm font-medium">

                                        {snakeCaseToTitleCase(video.muxTrackStatus || "no track found...")}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                            <FormField control={form.control} name="visibility" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Visibility</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a Visibility" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>

                                            <SelectItem value="public">
                                                <div className="flex items-center"> <Globe2Icon className="size-4 mr-2"></Globe2Icon>
                                                    Public</div>
                                            </SelectItem>
                                            <SelectItem value="private">
                                                <div className="flex items-center"> <LockIcon className="size-4 mr-2"></LockIcon>
                                                    Private</div>
                                            </SelectItem>

                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                </div>
            </div>
        </form>
        
    </Form>
   
    <ResponsiveModal title={"Monetize "} open={showMonetization}  onOpenChange={()=>{setShowMonetization(false)}}  >
       <div className="w-full overflow-y-scroll max-h-[80vh] no-scrollbar">
       <MonetizationForm videoId={videoId} video={video} selectedMonetization={selectedMonetization} onClose={()=>{setShowMonetization(false)}} />
       </div>
    </ResponsiveModal>
    </>)
}

export const FormSection = ({videoId}:FormSectionProps) => {
    return (
    <Suspense fallback={<FormSectionSkeleton />}> 
    <ErrorBoundary fallback={<p>Error</p>}>
        <FormSectionContent videoId={videoId} />
        </ErrorBoundary>
    </Suspense>
    )
}

const FormSectionSkeleton = () => {
    return (
        <div>
            <p>Loading...</p>
        </div>
    )
}
