import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { AuthButton } from "@/modules/auth/ui/components/auth-button"
import { StudioUploadModal } from "../studio-upload-modal"

import AppWalletProvider from "@/components/solana/provider"
import { WalletButton } from "@/components/solana/wallet-button"

export const StudioNavbar = () => {

    return (
        <nav className="fixed top-0 left-0 w-full h-16 bg-white flex items-center px-2 pr-5 z-50 border-b shadow-md"  >
            <div className="flex items-center gap-4 w-full ">
                <div className="flex items-center flex-shrink-0">
                    <SidebarTrigger />
                    <Link prefetch  href="/" className="hidden md:block">
                    <div className="flex items-center gap-1 p-4">
                    <Image src="/logo.svg" alt="logo" width={20} height={20} className="relative bottom-[5px]" />
                        <p className="text-xl font-semibold tracking-tight text-dripcast">Studio</p>
                    </div>
                    </Link>
                </div>

                 {/* { Search Bar} */}
                 <div className="flex-1">
                 </div>
                 <div>
                    <AppWalletProvider>
                        <WalletButton />
                    </AppWalletProvider>
                 </div>
                 <div className="flex-shrink-0 items-center flex gap-4"> 
                    <StudioUploadModal />
                    <AuthButton />
                 </div>
            </div>
        </nav>
    )

}