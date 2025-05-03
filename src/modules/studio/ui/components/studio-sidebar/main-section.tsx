"use client"

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem ,SidebarMenuButton} from "@/components/ui/sidebar"
import { FlameIcon, HomeIcon,  PlaySquareIcon } from "lucide-react"
import Link from "next/link"
import { useAuth, useClerk } from "@clerk/nextjs"

const items = [
    {title: "Home", icon: HomeIcon, url: "/"},
    {title: "Subscriptions", icon: PlaySquareIcon,auth:true,url: "/feed/subscriptions"},
    {title: "Trending", icon: FlameIcon,auth:false,url: "/feed/trending"},

    
]


export const MainSection = () => {
    const clerk = useClerk()
    const auth = useAuth()
    // const router = useRouter()
    return (
        <SidebarGroup>
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