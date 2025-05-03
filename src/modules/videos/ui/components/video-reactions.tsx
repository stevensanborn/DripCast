import { cn } from "@/lib/utils"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import {VideoGetOneOutput} from "../../types"
import { trpc } from "@/trpc/client"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

interface VideoReactionsProps{
    videoId:string;
    likes:number;
    dislikes:number;
    viewerReaction: VideoGetOneOutput["viewerReaction"];
}

export const VideoReactions = ({videoId,likes,dislikes,viewerReaction}:VideoReactionsProps) => {

    const clerk = useClerk();
    const utils = trpc.useUtils();
    
    const like = trpc.videoReactions.like.useMutation({
        onSuccess:()=>{
            utils.videos.getOne.invalidate({id: videoId})
            
        },
        onError:(error)=>{
            toast.error("failed to like video");
            console.log(error);
            if(error.data?.code === "UNAUTHORIZED"){
                clerk.openSignIn({redirectUrl:window.location.href});
            }
        }
    })

    const dislike = trpc.videoReactions.dislike.useMutation({
        onSuccess:()=>{
            utils.videos.getOne.invalidate({id: videoId})
        },
        onError:(error)=>{
            toast.error("failed to dislike video");
            if(error.data?.code === "UNAUTHORIZED"){
                clerk.openSignIn({redirectUrl:window.location.href});
            }
        }
    })
    
    

    return (

        <div className="flex items-center flex-none">
            <Button className="rounded-l-full rounded-r-none gap-2 pr-4" variant="secondary"
            disabled={like.isPending || dislike.isPending } onClick={()=>{
                console.log("clicked",videoId);
                like.mutate({videoId})
               
            }} >
                <ThumbsUpIcon className={cn("size-5",viewerReaction === "like" && "fill-black")} />
                {likes}
            </Button>
            <Separator orientation="vertical" className="h-7"></Separator>
            <Button variant="secondary" className="rounded-l-none rounded-r-full  pl-3"
            disabled={like.isPending || dislike.isPending } onClick={()=>dislike.mutate({videoId})}>
                <ThumbsDownIcon className={cn("size-5",viewerReaction === "dislike" && "fill-black")} />
                {dislikes}
            </Button>
            

        </div>
    )
}