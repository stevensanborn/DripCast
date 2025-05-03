"use client"

import { trpc } from "@/trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/constants"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"
import Link from "next/link"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { SubscriptionItem, SubscriptionItemSkeleton } from "../components/subscription-item"

export const SubscriptionSectionSuspense = () => {
    const utils = trpc.useUtils()
    const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery({
        limit: INFINITE_QUERY_LIMIT,
    },{
        getNextPageParam: (lastPage) => {
            if (!lastPage.nextCursor) return undefined;
            return {
                updatedAt: lastPage.nextCursor.updatedAt,
                creatorId: lastPage.nextCursor.id,
            };
        },
    })

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess:(data)=>{
            toast.success("Unsubscribed")
            utils.subscriptions.invalidate()
            utils.subscriptions.getMany.invalidate()
            utils.videos.getManySubscribed.invalidate()
            utils.users.getOne.invalidate({id:data.creatorId})
        }
        ,
        onError:()=>{
            toast.error("Failed to unsubscribe from creator")
        }
    })

    return (
        <>
        <div className="flex flex-col gap-4 ">
            {subscriptions.pages.flatMap((page)=>page.items)
            .map((subscription)=>(
                <Link prefetch  href={`/users/${subscription.user.id}`} key={subscription.creatorId}>
                    <SubscriptionItem name={subscription.user.name} imageUrl={subscription.user.imageUrl} 
                    subscriberCount={subscription.user.subscriberCount} 
                    onUnsubscribe={()=>{
                        unsubscribe.mutate({ userId:subscription.creatorId}) 
                    }}
                    disabled={unsubscribe.isPending}
                    />
                </Link>
                
            ))}
        </div>
            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
                
            ></InfiniteScroll>
        </>
    )
}


export const SubscriptionSection = () => {
    return (
        <Suspense fallback={<SubscriptionSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error loading subscriptions</p>}>
            <SubscriptionSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    )
}

const SubscriptionSectionSkeleton = ()=>{
    
    return (
        
           <div className="flex flex-col gap-4 ">
                {Array.from({length: 8}).map((_, index)=>(
                    <SubscriptionItemSkeleton key={index} />
                ))}
            </div>
        
    )
}