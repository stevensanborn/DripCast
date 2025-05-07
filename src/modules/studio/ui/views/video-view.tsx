import { FormSection } from "../sections/form-section"

interface VideoViewProps {
    videoId: string
}

export const VideoView = ({videoId}:VideoViewProps) => {
    
    return (
        <div className="px-4 pt-2.5 max-w-screen-lg ">
            <div>
               <FormSection videoId={videoId} />
            </div>
            
        </div>
    )
}   