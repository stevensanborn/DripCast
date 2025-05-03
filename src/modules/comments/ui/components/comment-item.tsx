import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { CommentGetManyOutput } from "../../types"
import UserAvatar from "@/components/user-avatar"
import { trpc } from "@/trpc/client"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {  MessageSquareIcon,  MoreVerticalIcon, Trash2Icon,  ThumbsUpIcon, ThumbsDownIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { useClerk } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CommentForm } from "./comment-form"
import { CommentReplies } from "./comment-replies"


interface CommentItemProps{
    comment:CommentGetManyOutput['items'][number]
    variant?: "comment" | "reply"
}

export const CommentItem = ({comment,variant="comment"}:CommentItemProps)=>{
    const clerkClient = useClerk()
    const utils = trpc.useUtils()
    const {userId} = useAuth()

    const [isReplying,setIsReplying] = useState(false)
    const [isRepliesOpen,setIsRepliesOpen] = useState(false)


    const remove = trpc.comments.remove.useMutation({
        onSuccess:()=>{
            toast.success("Comment deleted")
            utils.comments.getMany.invalidate({videoId:comment.videoId})
        },
        onError:(error)=>{
            toast.error(error.message)
            if(error.data?.code === "UNAUTHORIZED"){
                clerkClient.openSignIn( )
            }
        }
    })
   
    const like = trpc.commentReactions.like.useMutation({
        onSuccess:()=>{
            utils.comments.getMany.invalidate({videoId:comment.videoId})
        },
        onError:(error)=>{
            toast.error(error.message)
            if(error.data?.code === "UNAUTHORIZED"){
                clerkClient.openSignIn( )
            }
        }
    })
    const dislike = trpc.commentReactions.dislike.useMutation({
        onSuccess:()=>{
            utils.comments.getMany.invalidate({videoId:comment.videoId})
        },
        onError:(error)=>{
            toast.error(error.message)
            if(error.data?.code === "UNAUTHORIZED"){
                clerkClient.openSignIn( )
            }
        }
    })
    
    
    return(
        <div>
            <div className="flex gap-4">
                <Link prefetch  href={`/users/${comment.userId}`}>
                <UserAvatar  
                imageUrl={comment.user?.imageUrl??"/user-placeholder.png"} 
                name={comment.user?.name??""}
                size={variant === "comment" ? "sm" : "xs"}
                />
                </Link>
         
            <div className="flex-1 min-w-0">
                <Link prefetch  href={`/users/${comment.userId}`}>
                <div className="flex items-center gap-2 mb-0.5"> 
                    <span className="text-sm font-medium pb-0.5">
                        {comment.user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">    
                        {formatDistanceToNow(comment.updatedAt, {addSuffix:true})}
                    </span>
                </div>
                    
                </Link>
                <p className="text-sm text-gray-900">
                    {comment.value}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex  items-center ">
                        <Button className="size-8" variant="ghost" size="icon"
                                disabled={dislike.isPending||like.isPending}
                        onClick={()=>{like.mutate({commentId:comment.id})}}
                        >
                            <ThumbsUpIcon
                             className={cn(comment.viewerReaction === "like" && "fill-black")}/>
                        </Button>
                        <span className="text-xs text-muted-foreground">{comment.likeCount}</span>
                        <Button className="size-8" variant="ghost" size="icon"
                        disabled={dislike.isPending||like.isPending}
                        onClick={()=>{dislike.mutate({commentId:comment.id})}}
                        >
                            <ThumbsDownIcon
                    
                             className={cn(comment.viewerReaction === "dislike" && "fill-black")}/>
                        </Button>
                        <span  className="text-xs text-muted-foreground">{comment.dislikeCount}</span>
                    </div>
                    {variant =="comment" && (
                        <Button  className="size-8" variant="ghost" size="sm" onClick={()=>{setIsReplying(true)}}>Reply</Button>
                    )}
                </div>
            </div>
          
            <DropdownMenu modal={false} >
                <DropdownMenuTrigger className="size-8">
                   
                        <MoreVerticalIcon       className="size-4 text-muted-foreground"></MoreVerticalIcon>
                  
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {variant === "comment" && (
                    <DropdownMenuItem onClick={()=>{ setIsReplying(true)}} className="cursor-pointer">
                        <MessageSquareIcon className="size-4"> </MessageSquareIcon>
                        Reply
                    </DropdownMenuItem>
                    )}
                    {userId === comment.user?.clerkId && (
                    <DropdownMenuItem onClick={()=>{remove.mutate({id:comment.id})}} className="cursor-pointer">
                        <Trash2Icon className="size-4"> </Trash2Icon>
                        Delete
                    </DropdownMenuItem>)} 
                </DropdownMenuContent>
            </DropdownMenu>
         
        </div>
        {isReplying && (
            <div className="mt-4 pl-14">
                <CommentForm 
                videoId={comment.videoId}
                parentId={comment.id}
                variant="reply"
                onSuccess={()=>{
                    setIsReplying(false)
                    setIsRepliesOpen(true)  
                    }
                }
                onCancel={()=>{
                    setIsReplying(false)
                }}/>
            </div>
        )}
        {comment.replyCount > 0 && variant === "comment" && (
            <div className="pl-14">
                <Button size="sm" onClick={()=>{setIsRepliesOpen(!isRepliesOpen)}} variant="tertiary"> 
                    {isRepliesOpen? <ChevronUpIcon className="size-4"> </ChevronUpIcon> : <ChevronDownIcon className="size-4"> </ChevronDownIcon>}
                    {isRepliesOpen ? "Hide Replies" : "Show Replies"}
                </Button>
            </div>
        )}
        {
          comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
            <CommentReplies parentId={comment.id} videoId={comment.videoId}></CommentReplies>
          )
        }
        </div>
    )
}