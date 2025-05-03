import { UserView } from "@/modules/users/server/views/user-view"
import { HydrateClient, trpc } from "@/trpc/server"

interface PageProps{
    params:  Promise<{
        usersId: string
    }>
}

const Page = async ({params}:PageProps) => {
    const {usersId} = await params
    console.log("usersId",usersId)
    void trpc.users.getOne.prefetch({id:usersId})
    void trpc.videos.getMany.prefetchInfinite({userId:usersId,limit:10})
    return (
        <HydrateClient>
            <UserView userId={usersId}></UserView>
        </HydrateClient>
    )
    
}

export default Page