import {cva , type VariantProps} from "class-variance-authority"

import {useMemo} from "react"
import Link from "next/link"
import {UserInfo} from "@/modules/users/ui/components/user-info"
import UserAvatar from "@/components/user-avatar"

import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail"
import {VideoMenu} from "./video-menu"
import { VideoGetManyOutput } from "@/modules/videos/types"
import { cn } from "@/lib/utils"
import { Tooltip,TooltipContent,TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

const videoRowCardVariants = cva("group flex min-w-0 ",{
    variants:{
        size:{
            default:"gap-4",
            compact:"gap-2"
        }
    },
    defaultVariants:{
        size:"default"
    }
})

const thumbnailVariants = cva("relative flex-none",{
    variants:{
        size:{
            default:"w-[38%]",
            compact:"w-[168px]"
        }
    },
    defaultVariants:{
        size:"default"
    }
})

interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants>{
  data:VideoGetManyOutput["items"][number]
  onRemove:()=>void
}

export const VideoRowCard = ({data,onRemove,size="default"}:VideoRowCardProps)=>{

    const compactViews = useMemo(()=>{
        return Intl.NumberFormat("en",{
            notation:"compact",
        }).format(data.viewCount)
    },[data.viewCount])

    const compactLikes = useMemo(()=>{
        return Intl.NumberFormat("en",{
            notation:"compact",
        }).format(data.likeCount)
    },[data.likeCount]) 

    return(
        <div className={videoRowCardVariants({size})}>
            <Link prefetch  href={`/videos/${data.id}`} className={thumbnailVariants({size})}>
                <VideoThumbnail
                imageURL={data.thumbnailUrl}
                previewURL={data.previewUrl}
                title={data.title}
                duration={data.duration ?? 0}
                
                />
            </Link>
            {/* INfo */}

            <div className="flex-1 min-w-0 ">
                <div className="flex justify-between gap-x-2">
                    <Link prefetch  href={`/videos/${data.id}`} className="flex-1 min-w-0">
                        <h3 className={cn("font-medium line-clamp-2",
                             size === "compact"? "text-sm" : "text-base")}
                             >
                            {data.title} 
                        </h3>
                        {size === "default" && (
                            <>
                            <p className="text-muted-foreground text-xs mt-1">
                                {compactViews} views &#8226; {compactLikes} likes
                            </p>

                            <div className="flex items-center gap-2 my-3">
                                <UserAvatar size="sm" 
                                imageUrl={data.user?.imageUrl}
                                name={data.user?.name}
                                />
                                <UserInfo
                                name={data.user?.name}
                                variant="sm"
                                />
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="text-muted-foreground text-xs w-fit line-clamp-2">
                                        {data.description ?? "No description"}
                                    </p>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="center" className="bg-black/70">
                                    <p>
                                       From the video description
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            </>
                        )} 
                        {
                            size === "compact" && (
                             <>
                                <UserInfo variant="sm" name={data.user?.name}/>
                                <p className="text-muted-foreground text-xs mt-1">{compactViews} views  &#8226; {compactLikes}</p>
                             </>
                            )
                        
                        }
                        
                    </Link>
                    
                        <div className="flex-none"  >
                            <VideoMenu videoId={data.id} onRemove={onRemove} variant="ghost"/>
                        </div>
                </div>
            </div>
        </div>
    )
}

export const VideoRowCardSkeleton = ({size="default"}:VariantProps<typeof videoRowCardVariants>)=>{
    return(
        <div className={videoRowCardVariants({size})}>
            <div className={thumbnailVariants({size})}>
            <VideoThumbnailSkeleton />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-x-2">
                    <div className="flex-1 min-w-0">
                        <Skeleton className={cn("w-[40%] h-5",size === "compact" && " h-4 w-[40%]")} />
                        {size === "default" && (
                            <>
                            <Skeleton className="w-[20%] h-4 mt-1"  />
                                <div className="flex items-center gap-2 my-3">
                                    <Skeleton className="size-8 rounded-full" />
                                    <Skeleton className="w-24 h-4" />
                                </div>
                            </>
                        )}
                        {size === "compact" && (
                            <Skeleton className="w-[50%] h-4 mt-1" />
                        )}
                    </div>

                    
                </div>
            </div>
        </div>
    )
}











