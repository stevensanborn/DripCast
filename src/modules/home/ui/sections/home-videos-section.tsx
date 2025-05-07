"use client"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { INFINITE_QUERY_LIMIT } from "@/constants"
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface HomeVideosSectionProps{
    category_id?:string
}

const HomeVideosSectionSuspense = ({category_id}:HomeVideosSectionProps)=>{
    const [videos,videosQuery] = trpc.videos.getMany.useSuspenseInfiniteQuery({
        limit:INFINITE_QUERY_LIMIT,
        categoryId:category_id,
        visibility:"public"
    },{
        getNextPageParam:lastPage=>lastPage.nextCursor,
    })
    return(
        <div>
            <div className="gap-4 gap-y-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4
            [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
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

export const HomeVideosSection = (props:HomeVideosSectionProps)=>{
    return(
        <Suspense key={props.category_id} fallback={<HomeVideosSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading home videos</p>}>
                <HomeVideosSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    )
}


const HomeVideosSectionSkeleton = ()=>{
    return(
        <div>
            <div className="gap-4 gap-y-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xlg:grid-cols-3 2xl:grid-cols-4
            [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
            {Array.from({length:18}).map((_,index)=>(
                <VideoGridCardSkeleton key={index} />
            ))}
            </div>
        </div>
    )
}