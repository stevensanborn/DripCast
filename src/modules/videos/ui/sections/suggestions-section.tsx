
"use client"

import { trpc } from "@/trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/constants"
import { VideoRowCard } from "../components/video-row-card"
import { VideoGridCard } from "../components/video-grid-card"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { VideoRowCardSkeleton } from "../components/video-row-card"
import { VideoGridCardSkeleton } from "../components/video-grid-card"

interface SuggestionsSectionProps{
    videoId:string
    isManual?:boolean
}


export const SuggestionsSectionSuspense = ({videoId,isManual}:SuggestionsSectionProps) => {
    const [suggestions,query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery({videoId:videoId,limit:INFINITE_QUERY_LIMIT},
        {
            getNextPageParam:lastPage => lastPage.nextCursor
        }
    )

    return (
        <>
        <div className="hidden md:block space-y-10">
            {suggestions.pages.flatMap(page=>page.items).map(video=>{
                return(
                    <VideoRowCard
                    key={video.id}
                    data={video}
                    size="compact"
                    onRemove={()=>{}}
                    />
                )
            })}
        </div>
        <div className="block md:hidden space-y-10">
            {suggestions.pages.flatMap(page=>page.items).map(video=>{
                return(
                    <VideoGridCard
                    key={video.id}
                    data={video}
                    onRemove={()=>{}}
                    />
                )
            })}
        </div>
        <InfiniteScroll
        isManual={isManual}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        />
        </>
    )
}


export const SuggestionsSection = ({videoId,isManual}:SuggestionsSectionProps) => {
    return (
        <Suspense fallback={<SuggestionSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading suggestions</p>}>
            </ErrorBoundary>
            <SuggestionsSectionSuspense videoId={videoId} isManual={isManual} />
        </Suspense>
    )
}


export const SuggestionSectionSkeleton = () => {
    return (
        <>
        <div className="space-y-3 hidden md:block">
          {Array.from({length:8}).map((_,index)=>(
            <VideoRowCardSkeleton key={index} size="compact" />
          ))}
        </div>
        <div className="space-y-10 block md:hidden ">
          {Array.from({length:8}).map((_,index)=>(
            <VideoGridCardSkeleton key={index} />
          ))}
        </div>
        </>
    )
}