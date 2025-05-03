import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/user-avatar";
import {useUser} from "@clerk/nextjs"
import Link from "next/link";


const StudioSidebarHeader = () => {
    const {user} = useUser();
    const {state} = useSidebar();
    
    if(!user) return (
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Skeleton className="size-[112px] rounded-full" />
            <div className="flex flex-col mt-2 gap-y-2 items-center">
                <Skeleton className="h-4 w-[80px] rounded-full" />
                <Skeleton className="h-4 w-[100px] rounded-full" />
            </div>
        </SidebarHeader>
    );

    if(state === "collapsed") return (
        <SidebarMenuItem>
        <SidebarMenuButton 
        tooltip="Your profile" asChild>
            <Link prefetch  href="/users/current">
                <UserAvatar 
                imageUrl={user.imageUrl} 
                name={user.fullName ??"User"} 
                size="xs"
                />
                <span className="text-sm font-medium">Your Profile</span>
            </Link>
        </SidebarMenuButton>
       </SidebarMenuItem>
       
    );

    return (
       <SidebarHeader className="flex items-center justify-center">
        <Link prefetch  href="/users/current">
            <UserAvatar 
            imageUrl={user?.imageUrl} 
            name={user!.fullName!} 
            className="size-[112px] hover:opacity-80 transition-opacity duration-300"
            />
        </Link>
        <div className="flex flex-col mt-2 items-center gap-y-1">
            <p className="text-sm font-medium">Your Profile</p>
            <p className="text-xs text-muted-foreground">{user.fullName}</p>
        </div>
       </SidebarHeader>
    )
}       
export default StudioSidebarHeader;