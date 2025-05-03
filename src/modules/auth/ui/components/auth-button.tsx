"use client"

import { ClapperboardIcon, UserCircleIcon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserButton ,SignInButton, SignedOut, SignedIn} from "@clerk/nextjs"

export const AuthButton = () => {
    return (
        <>
        <SignedOut>
            <SignInButton mode="modal">
                <Button variant="outline" className="px-4 py-2 text-blue-600 font-medium hover:text-blue-500  border-blue-500/2 rounded-full shadow-none ">
                    <UserCircleIcon ></UserCircleIcon>Sign In
                </Button>
            </SignInButton>
        </SignedOut>
        <SignedIn>
            <UserButton >
                <UserButton.MenuItems>
                <UserButton.Link 
                label="My Profile"
                href="/users/current"
                labelIcon={<UserIcon className="size-4"/>}
                >
                </UserButton.Link>

                <UserButton.Link 
                label="Studio"
                href="/studio"
                labelIcon={<ClapperboardIcon className="size-4"/>}
                >

                </UserButton.Link>
                </UserButton.MenuItems>

            </UserButton>
            {/* Add menu items here */}
        </SignedIn>
        </>
    )
}