import { FormSection } from "../sections/form-section"

interface VideoViewProps {
    videoId: string
}

export const VideoView = ({videoId}:VideoViewProps) => {
    
    // const video = trpc.studio.getOne({id: videoId})
    // if(!video || Object.keys(video).length===0){
    //     return(
    //         <div className="pt-2.5 max-w-screen-lg  px-4">
    //             <p className="text-sm text-muted-foreground">Video not found</p>
    //         </div>
    //     )
    // }
    return (
        <div className="px-4 pt-2.5 max-w-screen-lg ">
            <div>
               <FormSection videoId={videoId} />
            </div>
            
        </div>
    )
}   