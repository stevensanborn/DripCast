
"use client"

import { CommentForm } from "@/modules/comments/ui/components/comment-form"
import { CommentItem } from "@/modules/comments/ui/components/comment-item"
import { trpc } from "@/trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/constants"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { Loader2Icon } from "lucide-react"
interface CommentsSectionProps{
    videoId:string
}
 const CommentsSectionSuspense = ({videoId}:CommentsSectionProps) => {

    const [comments,query] = trpc.comments.getMany.useSuspenseInfiniteQuery({videoId:videoId,limit:INFINITE_QUERY_LIMIT},{
        getNextPageParam:lastPage=>lastPage.nextCursor
    })
    
    return (
        <div className="mt-6">
            <div  className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">
                    {comments.pages[0].totalCount} Comments 
                </h1>
                <CommentForm videoId={videoId} />
                <div className="flex flex-col gap-4 mt-2 ">
                    {
                        comments.pages.flatMap((page)=>page.items).map((comment)=>(
                            <CommentItem key={comment.id} comment={comment} />
                        ))
                    }
                    <InfiniteScroll
                   
                    hasNextPage={query.hasNextPage}
                    isFetchingNextPage={query.isFetchingNextPage}
                    fetchNextPage={query.fetchNextPage}
                    />
                </div>
            </div>
          
        </div>
    )
}


export const CommentsSection = ({videoId}:CommentsSectionProps) => {
    return (
        <Suspense fallback={<CommentsSectionSkeleton />}>
        
            <ErrorBoundary fallback={<p>Error</p>}>
                <CommentsSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const CommentsSectionSkeleton = () => {
    return (
        <div className="mt-6 flex justify-center items-center">
            <Loader2Icon className="text-muted-foreground animate-spin size-7"></Loader2Icon>
        </div>
    )
}