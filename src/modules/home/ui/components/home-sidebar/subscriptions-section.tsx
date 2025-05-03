"use client"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem ,SidebarMenuButton, SidebarGroupLabel} from "@/components/ui/sidebar"
import UserAvatar from "@/components/user-avatar"
import { INFINITE_QUERY_LIMIT } from "@/constants"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { ListIcon } from "lucide-react"


export const SubscriptionsSection = () => {
    const pathname = usePathname()

    const {data,isLoading}= trpc.subscriptions.getMany.useInfiniteQuery({
        limit:INFINITE_QUERY_LIMIT,
    },{
        getNextPageParam: (lastPage) => {
            if (!lastPage.nextCursor) return undefined;
            return {
                updatedAt: lastPage.nextCursor.updatedAt,
                creatorId: lastPage.nextCursor.id,
                id: lastPage.nextCursor.id
            };
        }
    });

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {isLoading && (<LoadingSkeleton />)}

                    {!isLoading && data?.pages.flatMap((page)=>page.items).map((subscription) => (
                        <SidebarMenuItem key={`${subscription.creatorId}-${subscription.viewerId}`}>
                            <SidebarMenuButton 
                            asChild 
                            tooltip={subscription.user.name} 
                            isActive={pathname === `/users/${subscription.user.id}`} // change to look at pathname
                           >

                                <Link prefetch  href={`/users/${subscription.user.id}`} className="flex items-center gap-4">
                                   <UserAvatar size="xs" imageUrl={subscription.user.imageUrl}  name={subscription.user.name} />
                                   <span className="text-sm font-medium">{subscription.user.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    {!isLoading && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild
                            isActive={pathname === "/subscriptions"}>
                                <Link prefetch  href="/subscriptions" className="flex items-center gap-4">
                                    <ListIcon className="size-4" />
                                    <span className="text-sm">All Subscriptions</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export const LoadingSkeleton = () => {
    return (
    <>
    {[1,2,3,4].map((i)=>(
        <SidebarMenuItem key={i}>
            <SidebarMenuButton disabled>
                <Skeleton className="size-6 rounded-full shrink-0" />
                <Skeleton className="w-full h-4" />
            </SidebarMenuButton>
        </SidebarMenuItem>
    ))}
    </>
    )

}