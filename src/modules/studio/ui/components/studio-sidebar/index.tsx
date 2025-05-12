"use client"

import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Link from "next/link"
import { Loader2Icon, LogOutIcon,  SquarePlusIcon, VideoIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import StudioSidebarHeader from "./studio-sidebar-header"
import StudioUploader from "../studio-uploader"
import { ResponsiveModal } from "../responsive-modal"
import { toast } from "sonner"
import { trpc } from "@/trpc/client"
import { Button } from "@/components/ui/button"

export const StudioSidebar = () => {
    const pathname = usePathname()
    const utils = trpc.useUtils();
    const router = useRouter();
    const create = trpc.videos.create.useMutation({
        onSuccess: ()=>{
            toast.success("Video created");
            utils.studio.getMany.invalidate();
        },
        onError: ()=>{
            toast.error("Error creating video");
        }
    });

    const onSuccess = ()=>{
        if(!create.data?.video)return;
        create.reset();
        router.push(`/studio/videos/${create.data.video.id}`);
    }
    
    return (<>
        <Sidebar className="pt-16 z-40 " collapsible="icon">
            <SidebarContent className="bg-background" >
                <SidebarGroup>
                <SidebarMenu>
                    <StudioSidebarHeader />
                <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/studio/"} tooltip="Exit Studio" asChild> 
                    <Link prefetch  href="/studio/">
                        <VideoIcon className="size-5"/>
                        <span className="text-sm font-medium">Content</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/studio/"} tooltip="Create new video" asChild> 
                    <Button variant="ghost" className="flex justify-start" onClick={()=>{
            create.mutate();
        }} disabled={create.isPending}>
                        <SquarePlusIcon className="size-5"/>
                        <span className="text-sm font-medium">Create New</span>
                    </Button>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <Separator />
                <SidebarMenuItem>
                <SidebarMenuButton tooltip="Exit Creator" asChild> 
                    <Link prefetch  href="/">
                        <LogOutIcon className="size-5"/>
                        <span className="text-sm font-medium">Exit Creator</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>

                </SidebarMenu>
                </SidebarGroup>
                </SidebarContent>
        </Sidebar>


            <ResponsiveModal title={"Upload Video"} open={!!create.data?.url}  onOpenChange={()=>{create.reset()}} >
                
                {
                create.data?.url ? 
                    <StudioUploader endpoint={create.data?.url} onSuccess={onSuccess} />
                    : <Loader2Icon className="animate-spin"></Loader2Icon>
                }
            </ResponsiveModal>

        </>
        
    )
}