
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { SearchInput } from "./search-input"
import { AuthButton } from "@/modules/auth/ui/components/auth-button"

import AppWalletProvider from "@/components/solana/provider"
import { WalletButton } from "@/components/solana/wallet-button"

export const HomeNavbar = () => {

    return (
     
        <nav className="fixed top-0 left-0 w-full h-16 nav-linear-gradient flex items-center px-2 pr-5 z-50" >
            <div className="flex items-center gap-4 w-full ">
                <div className="flex items-center flex-shrink-0">
                    <SidebarTrigger className="text-dripcast" />
                    <Link prefetch  href="/" className="hidden md:block">
                    <div className="flex items-center gap-1 p-4">
                    <Image src="/logo.svg" alt="logo" width={20} height={20} className="relative bottom-[3px]" />
                        <p className="text-xl font-semibold tracking-tight text-gray-100">DripCast</p>
                    </div>
                    </Link>
                </div>

                 {/* { Search Bar} */}
                 <div className="flex justify-center flex-1 max-w-[720px] mx-auto">
                    <SearchInput />
                 </div>
                 <div>
                    <AppWalletProvider>
                        <WalletButton />
                    </AppWalletProvider>
                 </div>
                 
                 <div className="flex-shrink-0 items-center flex gap-4"> 
                    <AuthButton />
                 </div>
            </div>
        </nav>
       
    )

}