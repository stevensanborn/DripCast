"use client"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { INFINITE_QUERY_LIMIT } from "@/constants"
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface VideosSectionProps{
    userId:string
}

const VideosSectionSuspense = ({userId}:VideosSectionProps)=>{
    const [videos,videosQuery] = trpc.videos.getMany.useSuspenseInfiniteQuery({
        limit:INFINITE_QUERY_LIMIT,
        userId:userId,
    },{
        getNextPageParam:lastPage=>lastPage.nextCursor,
    })
    return(
        <div>
            <div className="gap-4 gap-y-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {videos.pages.map(page=>page.items.map(item=>{
                return(
                    <VideoGridCard data={item} key={item.id} onRemove={()=>{}} />
                )
            }))}
            </div>
            <InfiniteScroll
            hasNextPage={videosQuery.hasNextPage}
            isFetchingNextPage={videosQuery.isFetchingNextPage}
            fetchNextPage={videosQuery.fetchNextPage}
            />

        </div>
    )
}

export const VideosSection = (props:VideosSectionProps)=>{
    return(
        <Suspense key={props.userId} fallback={<VideosSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading videos</p>}>
                <VideosSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    )
}


const VideosSectionSkeleton = ()=>{
    return(
        <div>
            <div className="gap-4 gap-y-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({length:18}).map((_,index)=>(
                <VideoGridCardSkeleton key={index} />
            ))}
            </div>
        </div>
    )
}