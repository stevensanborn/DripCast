import VideoView from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { INFINITE_QUERY_LIMIT  } from "@/constants";

export const dynamic = "force-dynamic"

interface VideoPageProps{
    params: Promise<{videoId: string}>
    
}

const VideoPage = async ({params}:VideoPageProps) => {
    const {videoId} = await params;

    trpc.videos.getOne.prefetch({id: videoId});
    trpc.comments.getMany.prefetchInfinite({videoId,limit:INFINITE_QUERY_LIMIT })
    trpc.suggestions.getMany.prefetchInfinite({videoId,limit:INFINITE_QUERY_LIMIT })
    trpc.monetization.getMany.prefetch({videoId})
    return(
        <HydrateClient>
            <VideoView videoId={videoId} />
        </HydrateClient>
    )   
}


    export default VideoPage;