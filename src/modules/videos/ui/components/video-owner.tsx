import { VideoGetOneOutput } from "../../types"
import Link from "next/link"
import UserAvatar from "@/components/user-avatar"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { SubscriptionButton } from "@/modules/subscriptions/ui/subscriptions-button"
import { UserInfo } from "@/modules/users/ui/components/user-info"
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription"

interface VideoOwnerProps{
    user: VideoGetOneOutput["user"]
    videoId: VideoGetOneOutput["id"]
}


export const VideoOwner = ({user,videoId}:VideoOwnerProps) => {
    
    const {userId:clerkUserId,isLoaded} = useAuth() 

    const {onClick,isPending} = useSubscription({
        userId:user.id,
        isSubscribed:user.viewerSubscribed,
        fromVideoId:videoId
    })

    return (
        <div className="flex items-center sm:item-start justify-between sm:justify-start gap-3 min-w-0">
            <Link prefetch  href={`/users/${user.id}`} className="flex items-center gap-2">
            <div className="flex items-center gap-3 min-w-0">
            <UserAvatar  size="lg" imageUrl={user.imageUrl} name={user.name} />
            <div className="flex flex-col gap-1 min-w-0">
                <UserInfo variant="lg"  name={user.name} />
                <span className="text-sm text-muted-foreground line-clamp-1"> {user.subscriberCount} subscribers</span>
                </div>
            </div>
            </Link>
            {clerkUserId === user.clerkId ? (
                <Button className="rounded-full" variant="secondary"  asChild>
                    <Link prefetch  href={`/studio/videos/${videoId}`}>
                        Edit Video
                    </Link>
                </Button>
            ):(<SubscriptionButton onClick={onClick} 
            disabled={isPending || !isLoaded} 
            isSubscribed={user.viewerSubscribed} 
            className={"flex-none"} 
            
            />)}
        
        </div>    
    )
}