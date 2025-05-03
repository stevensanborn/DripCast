import UserAvatar from "@/components/user-avatar"
import { UserGetOneOutput } from "../../types"
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubscriptionButton } from "@/modules/subscriptions/ui/subscriptions-button"
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPageInfoProps{
    user:UserGetOneOutput
}

export const UserPageInfo = ({user}:UserPageInfoProps) => {
    const {userId,isLoaded} = useAuth();
    const clerk = useClerk();

    const {isPending, onClick }= useSubscription({
        userId:user.id,
        isSubscribed:user.viewerSubscribed,
    })

    return <div className="flex flex-col">
        <div className="py-6">
            {/* MOBILE */}
          <div className="flex flex-col md:hidden">
            <div className="flex items-center gap-x-3">
                <UserAvatar  size="lg" imageUrl={user.imageUrl} name={user.name} className="w-[60px] h-[60px]" 
                onClick={()=>{
                    if(userId === user.clerkId){
                        clerk.openUserProfile();
                    }
                }}/>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold">{user.name}</h1>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <span >{user.subscriberCount} subscribers</span>  <span> &bull; </span>
                        <span >{user.videoCount} videos</span>
                    </div>
                </div>
            </div>
            {userId === user.clerkId ?(
                <Button variant="secondary" className="w-full mt-3 rounded-full" asChild ><Link prefetch  href="/studio">Go to Studio</Link></Button>
            ):(
                <SubscriptionButton disabled={isPending || !isLoaded } isSubscribed={user.viewerSubscribed} onClick={onClick}
                className="w-full mt-3 "
                />
            )}
          </div>
          {/* DESKTOP */}
          <div className="items-start  md:flex hidden gap-4">
          <UserAvatar  size="xl" imageUrl={user.imageUrl} name={user.name} 
          className={cn(userId===user.clerkId && "cursor-pointer hover:opacity-80 transition-opacity duration-300")} 
                onClick={()=>{
                    if(userId === user.clerkId){
                        clerk.openUserProfile();
                    }
                }}/>
                <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-bold">{user.name}</h1>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
                        <span >{user.subscriberCount} subscribers</span>  <span> &bull; </span>
                        <span >{user.videoCount} videos</span>
                    </div>
                    {userId === user.clerkId ?(
                <Button variant="secondary" className="mt-3 rounded-full" asChild ><Link prefetch  href="/studio">Go to Studio</Link></Button>
            ):(
                <SubscriptionButton disabled={isPending || !isLoaded } isSubscribed={user.viewerSubscribed} onClick={onClick}
                className=" mt-3 "
                />
            )}
                </div>
          </div>
           
        </div>
    </div>
}

export const UserPageInfoSkeleton = ()=>{
    return(
        <div className="py-6">
           {/* Mobile layout */}
           <div className="flex flex-col md:hidden">
            <div className="flex items-center gap-3">
                <Skeleton className="w-[60px] h-[60px] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-48 h-4 mt-1" />
            </div>
           </div>
           {/* Desktop layout */}
           <div className="items-start md:flex hidden gap-4">
           <Skeleton className="w-[160px] h-[160px] rounded-full" />
           <div className="flex-1 min-w-0">
                <Skeleton className="w-64 h-8" />
                <Skeleton className="w-48 h-5 mt-1" />
                <Skeleton className="w-32 h-10 mt-1" />
            </div>
           </div>
        </div>
    )
}