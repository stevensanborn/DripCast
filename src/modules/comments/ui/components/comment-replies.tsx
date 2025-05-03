import { INFINITE_QUERY_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"
import {  CornerDownRightIcon, Loader2 } from "lucide-react"
import { CommentItem } from "./comment-item"
import { Button } from "@/components/ui/button"
interface CommentRepliesProps{
    parentId:string,
    videoId:string
}

export const CommentReplies = ({parentId,videoId}:CommentRepliesProps)=>{
    
    const {data:replies,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        } = trpc.comments.getMany.useInfiniteQuery({
        videoId,
        parentId,
        limit:INFINITE_QUERY_LIMIT,
        
    },{
        getNextPageParam:(lastPage)=>{
            return lastPage.nextCursor
        }
    })
    return(
        <div className="pl-14">
            <div className="flex flex-col gap-4 mt-2">
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="size-6 text-muted-foreground  animate-spin"/>
                    </div>
                ) : (
                    replies?.pages.flatMap((page)=>page.items).map((reply)=>(
                        <CommentItem key={reply.id} comment={reply} variant="reply" />
                    ))
                )   }
            </div>
           {hasNextPage && (
               <Button onClick={()=>fetchNextPage()} disabled={isFetchingNextPage} variant="tertiary">
                <CornerDownRightIcon className=""/>
                    {isFetchingNextPage ? "Loading..." : "Show More Replies"}
                </Button>
           )}
        </div>
    )
}