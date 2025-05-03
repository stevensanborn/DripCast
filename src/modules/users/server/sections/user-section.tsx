"use client"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { UserPageBanner, UserPageBannerSkeleton } from "../../ui/components/user-page-banner"
import { UserPageInfo, UserPageInfoSkeleton } from "../../ui/components/user-page-info"
import { Separator } from "@/components/ui/separator"

interface UserSectionProps{
    userId:string
}

export const UserSection = ({userId}:UserSectionProps) => {
    return (
        <Suspense fallback={<UserSectionSkeleton />}> 
            <ErrorBoundary fallback={<div>Error...</div>}>
            <UserSectionSuspense userId={userId}></UserSectionSuspense>
            </ErrorBoundary>
        </Suspense>
    )
}

const UserSectionSuspense = ({userId}:UserSectionProps) => {
    const [user] = trpc.users.getOne.useSuspenseQuery({id:userId})

    
    return (
        <div className="flex flex-col " >
            <UserPageBanner user={user}></UserPageBanner>
            <UserPageInfo user={user}></UserPageInfo>
            <Separator  />
        </div>
    )

}

const UserSectionSkeleton = ()=>{
    return(
        <div className="flex flex-col " >
            <UserPageBannerSkeleton></UserPageBannerSkeleton>
            <UserPageInfoSkeleton></UserPageInfoSkeleton>
            <Separator  />
        </div>
    )
}