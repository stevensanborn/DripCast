"use client"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem ,SidebarMenuButton, SidebarGroupLabel} from "@/components/ui/sidebar"
import { useAuth } from "@clerk/nextjs"
import { useClerk } from "@clerk/nextjs"
import { HistoryIcon,    ThumbsUpIcon } from "lucide-react"
import Link from "next/link"

const items = [
    {title: "History", icon: HistoryIcon, auth:true, url: "/history"},
    {title: "Liked Videos", icon: ThumbsUpIcon,auth:true,url: "/playlists/liked"},
    
]


export const PersonalSection = () => {
    const clerk = useClerk()
    const auth = useAuth()
    
    return (
        <SidebarGroup>
            <SidebarGroupLabel>You</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                            asChild 
                            tooltip={item.title} 
                            isActive={false} // change to look at pathname
                            onClick={(e) => {

                                if(!auth.isSignedIn && item.auth){
                                    e.preventDefault()
                                    clerk.openSignIn({redirectUrl: item.url})
                                   }

                            }} 
                            >

                                <Link prefetch  href={item.url} className="flex items-center gap-4">
                                   <item.icon />
                                   <span className="text-sm font-medium">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}