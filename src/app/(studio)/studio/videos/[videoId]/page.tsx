import { VideoView } from "@/modules/studio/ui/views/video-view";
import { trpc } from "@/trpc/server";

export const dynamic = "force-dynamic"


interface StudioVideosPageProps {
    params: Promise<{
        videoId: string
    }>
}

const StudioVideosPage = async ({params}:StudioVideosPageProps) => {

    const {videoId} = await params;

    if(!videoId){
        return(
            <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Video not found</p>
            </div>
        )
    }
    void trpc.studio.getOne.prefetch({id: videoId})
    void trpc.categories.getMany.prefetch()
    void trpc.monetization.getMany.prefetch({videoId})
    void trpc.monetization.getMonetizationPayments.prefetch({videoId})
    
    return (
        <div>
            <VideoView videoId={videoId} />
        </div>
    )
}

export default StudioVideosPage;