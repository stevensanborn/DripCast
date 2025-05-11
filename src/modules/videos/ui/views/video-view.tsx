"use client"
import VideoSection from "../sections/video-section";
import { SuggestionsSection } from "../sections/suggestions-section";
import { CommentsSection } from "../sections/comments-section";

interface VideoViewProps{
    videoId: string
}

const VideoView = ({videoId}:VideoViewProps) => {
    
    return (
        <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
            <div className="flex-1 min-w-0 flex flex-col gap-6 xl:flex-row">
                <div className="flex-1 min-w-0 flex flex-col">
                     <VideoSection videoId={videoId} />
                    <div className="xl:hidden block mt-4">
                        <SuggestionsSection videoId={videoId}></SuggestionsSection>
                    </div>
                    <CommentsSection videoId={videoId}></CommentsSection>
                </div>
                <div className="hidden xl:block w-full xl:w-[380px] 2xl:[460px] shrink-1">
                    <SuggestionsSection videoId={videoId} isManual={true}></SuggestionsSection>
                </div>
            </div>
        </div>
    )
}

export default VideoView;