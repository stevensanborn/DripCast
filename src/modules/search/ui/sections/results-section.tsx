"use client"

import { INFINITE_QUERY_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"
import { useIsMobile } from "@/hooks/use-mobile"
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card"
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface ResultsSectionProps{
    query:string | undefined,
    categoryId:string | undefined,
}

const ResultsSectionSuspense = ({query,categoryId}:ResultsSectionProps)=>{
    const isMobile = useIsMobile()
    const[results,resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery({
        query: decodeURIComponent(query!),
        limit:INFINITE_QUERY_LIMIT,
        categoryId:categoryId!,
    },{
        getNextPageParam:lastPage=>lastPage.nextCursor
    })

    return(
        <>
        {isMobile ? (
            <div className="flex flex-col gap-4 gap-y-10"> 
                {results.pages.map(page=>page.items.map(item=>{
                    return(
                        <VideoGridCard data={item} key={item.id} onRemove={()=>{}} />
                    )
                }))}
            </div>
        ):(
            <div className="flex flex-col gap-4">
                {results.pages.map(page=>page.items.map(item=>{
                    return(
                        <VideoRowCard data={item} key={item.id} onRemove={()=>{}} />
                    )
                }))}
            </div>
        )}
        <InfiniteScroll 
        hasNextPage={resultQuery.hasNextPage}
        isFetchingNextPage={resultQuery.isFetchingNextPage}
        fetchNextPage={resultQuery.fetchNextPage}
        />
           
        </>
    )
}


export const ResultsSection = (props:ResultsSectionProps)=>{
    return(
        <Suspense key={`${props.query}-${props.categoryId}`} fallback={<ResultsSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading search results</p>}>
                <ResultsSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    )
}

const ResultsSectionSkeleton = ()=>{
    return(
        <div>

            <div className="hidden flex-col gap-4 md:flex ">
                {
                    Array.from({length:INFINITE_QUERY_LIMIT}).map((_,index)=>(
                        <VideoRowCardSkeleton key={index} />
                    ))
                }
            </div>
            <div className="flex flex-col gap-4 md:hidden ">
                {
                    Array.from({length:INFINITE_QUERY_LIMIT}).map((_,index)=>(
                        <VideoGridCardSkeleton key={index} />
                    ))
                }
            </div>
        </div>
        
    )
}